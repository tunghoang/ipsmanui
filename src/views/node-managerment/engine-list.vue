<template>
  <div class="app-container user-managerment">
    <div class="filter-container">
      <el-autocomplete
                v-model="engineTypeSelect"
                class="filter-item"
                value="name"
                clearable
                @select="handleAutocomplete"
                :fetch-suggestions="querySearchAsync"
                @keyup.enter.native="handleAutocomplete"
                :placeholder="$t('table.engine_type')">
        <template slot-scope="{ item }">
          <span class="value">{{ item.name }}</span>
        </template>
      </el-autocomplete>
      <el-button v-waves class="filter-item ml-1" type="primary" icon="el-icon-search" @click="handleRefreshTable">
        {{ $t('table.search') }}
      </el-button>
      <el-button v-waves :loading="isSubmitting" style="margin-left: 10px; float: right;" class="filter-item float-right" type="primary" icon="el-icon-download" @click="handleDownload">
        {{ $t('table.export') }}
      </el-button>
      <el-button style="float: right;" class="filter-item float-right" type="primary" icon="el-icon-plus" @click="handleCreateSingle">
        {{ $t('table.add') }}
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      fit
      stripe
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column :label="$t('table.id')" prop="idEngine" sortable align="center" width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.idEngine }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.idEnginetype')" sortable prop="idEnginetype" align="center">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.idEnginetype }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.specs')" sortable prop="specs" align="center">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.specs }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" fixed="right" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            {{ $t('table.edit') }}
          </el-button>
          <el-button type="danger" size="mini" @click="handleDelete(row)">
            {{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column> 
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="params.page" :limit.sync="params.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" @close="resetError()">
      <el-form ref="dataFormSingle" :model="temp" label-position="left" label-width="120px" style="width: 100%">
        <el-form-item :label="$t('table.name')" prop="idEnginetype">
          <el-select
                v-model="temp.idEnginetype"
                class="filter-item"
                placeholder="Please select"
                name="enginetype"
                @focus="resetError"
                :class="{ error: errors.has('enginetype') }"
                data-vv-validate-on="none"
                v-validate="'required'">
            <el-option v-for="item in engineTypes" :key="item.idEnginetype" :label="item.name" :value="item.idEnginetype" />
          </el-select>
          <div class="el-form-item__error" v-if="errors.has('enginetype')">
            {{ errors.first('enginetype') }}
          </div>
        </el-form-item>
        <el-form-item :label="`${$t('table.specs')}(JSON)`" props="specs">
          <json-editor
            ref="jsonEditor"
            v-model="temp.specs"
            tabindex="1"
            @focus="resetError"
            name="specs"
            :placeholder="$t('table.specs')"
            :class="{ error: errors.has('specs') }"
            data-vv-validate-on="none"
            v-validate="'required|min:4|max:255'" />
<!--           <el-input v-model="temp.specs"
                    tabindex="1"
                    @focus="resetError"
                    name="specs"
                    :placeholder="$t('table.specs')"
                    :class="{ error: errors.has('specs') }"
                    data-vv-validate-on="none"
                    v-validate="'required|min:4|max:255'" /> -->
          <div class="el-form-item__error" v-if="errors.has('specs')">
            {{ errors.first('specs') }}
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import JsonEditor from '@/components/JsonEditor'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import rf from 'requestfactory'
import { Message } from 'element-ui'
import RemoveErrorsMixin from 'common/RemoveErrorsMixin'

export default {
  name: 'EngineList',
  components: { Pagination, JsonEditor },
  directives: { waves },
  mixins: [RemoveErrorsMixin],
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      params: {
        page: 1,
        limit: 20,
        key: undefined,
        idEnginetype: undefined,
        sort: 'updated_at',
        order: 'desc'
      },
      temp: {
        idEngine: undefined,
        idEnginetype: '',
        name: '',
        specs: {}
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: this.$t('table.edit'),
        create: this.$t('table.create')
      },
      engineTypes: [],
      engineTypeSelect: '',
      fileList: [],
      isSubmitting: false
    }
  },
  async mounted() {
    await this.loadEngineTypes()
  },
  methods: {
    getList() {
      rf.getRequest('EngineRequest').getList(this.params)
      .then(async response => {
        this.list = window._.map(response, res => {
          return {
            idEngine: res.idEngine,
            idEnginetype: res.idEnginetype,
            specs: JSON.parse(res.specs)
          }
        })
        this.total = response.length
      })
      .catch(error => {
        this.errors.add({field: 'error', msg: error.response.data.message});
        Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
      })
      .finally(() => this.listLoading = false)
    },
    loadEngineTypes() {
      let params = {}
      rf.getRequest('EngineTypeRequest').getList(params)
      .then(async response => {
        await this.getList()
        this.engineTypes = window._.map(response, engineType => {
          return {
            idEnginetype: engineType.idEnginetype,
            name: engineType.name,
            value: engineType.name,
            description: engineType.description
          }
        })
        this.options = window._.cloneDeep(response)
      })
      .catch(error => {
        this.errors.add({field: 'error', msg: error.response.data.message});
        Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
      });
    },
    querySearchAsync(queryString, cb) {
      var roles = this.engineTypes;
      var results = queryString ? roles.filter(this.createFilter(queryString)) : roles;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        cb(results);
      }, 1000 * Math.random());
    },
    createFilter(queryString) {
      return (link) => {
        return (link.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
      };
    },
    handleAutocomplete (value) {
      console.log(value)
      this.params.idEnginetype = value.idEnginetype
      this.handleRefreshTable()
    },
    handleRefreshTable() {
      this.listLoading = true
      this.params.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
        this.sortBy(prop, order)
    },
    getSortClass: function() {
      const order = this.params.order
      return order === `asc`
      ? 'ascending'
      : order === `desc`
      ? 'descending'
      : ''
    },
    sortBy(col, order) {
      this.params.sort = col
      if (order === 'ascending') {
        this.params.order = 'asc'
      } else {
        this.params.order = 'desc'
      }
      this.handleFilter()
    },
    handleFilter() {
      this.params.page = 1
      this.getList()
    },
    handleError(error) {
      this.convertRemoteErrors(error);
      if (this.errors.has('error')) {
        this.errors.add({field: 'error', msg: error.response.data.message});
        Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
      }
    },
    handleCreateSingle() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataFormSingle'].clearValidate()
      })
    },
    async createData() {
      this.resetError();
      if (this.isSubmitting) {
        return;
      }
      await this.$validator.validate('enginetype');
      await this.$validator.validate('specs');
      if (this.errors.any()) {
        return;
      }
      rf.getRequest('EngineRequest').create(this.temp)
      .then(() => {
        this.dialogFormVisible = false
        this.$notify({
          title: this.$t('notify.success.label'),
          message: this.$t('notify.success.createSuccess'),
          type: 'success',
          duration: 1000,
          showClose: false
        })
        this.handleRefreshTable()
      })
      .catch(error => {
        this.handleError(error)
      })

    },
    resetTemp() {
      this.temp = {
        idEngine: undefined,
        idEnginetype: '',
        specs: {}
      }
    },
    handleUpdate(row) {
      row = {
        ...row
      }
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
    },
    async updateData() {
      this.resetError();
      if (this.isSubmitting) {
        return;
      }
      await this.$validator.validate('enginetype');
      await this.$validator.validate('specs');
      if (this.errors.any()) {
        return;
      }
      let params = window._.cloneDeep(this.temp)
      rf.getRequest('EngineRequest').update(params.idEngine, params)
      .then(() => {
        this.dialogFormVisible = false
        this.$notify({
          title: this.$t('notify.success.label'),
          message: this.$t('notify.success.updateSuccess'),
          type: 'success',
          duration: 1000,
          showClose: false
        })
        this.handleRefreshTable()
      })
    },
    handleDownload() {
      this.isSubmitting = true
      rf.getRequest('EngineRequest').export(this.params)
      .then(async response => {
        let dataExport = []
        response.map((item, index) => {item.no = index + 1 ; dataExport.push(item)})
        this.handleExport(dataExport);
      })
      .catch(error => {
        this.isSubmitting = false
        this.errors.add({field: 'error', msg: error});
        this.$notify({
          title: this.$t('notify.errors.label'),
          message: this.$t(this.errors.first('error')) || this.$t('notify.errors.unknow'),
          type: 'error',
          duration: 1000,
          showClose: false
        })
      });
    },
    handleExport(dataExport) {
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = [this.$t('no'), this.$t('table.name')]
        const filterVal = ['no', 'name']
        const data = this.formatJson(filterVal, dataExport)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: `${this.$t('route."user list"')}`
        })
        this.isSubmitting = false
      })
      .catch(error => {
        this.isSubmitting = false
        this.$notify({
          title: this.$t('notify.errors.label'),
          message: error,
          type: 'error',
          duration: 1000,
          showClose: false
        })
      });
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    handleDelete(row) {
      this.$confirm(this.$t('notify.text.delete'), 'Warning', {
        confirmButtonText: this.$t('action.ok'),
        cancelButtonText: this.$t('action.cancel'),
        type: 'warning',
        center: true
      }).then(() => {
        rf.getRequest('EngineRequest').delete(row.idEngine)
          .then(() => {
            this.$message({
              type: 'success',
              message: this.$t('notify.success.deleteSuccess')
            })
            this.handleRefreshTable()
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: this.$t('notify.info.cancel'),
        });
      });
    }
  },
}
</script>
