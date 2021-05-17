<template>
  <div class="app-container user-management">
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
      <el-table-column :label="$t('table.name')" prop="name" sortable align="center" width="140px">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.idEnginetype')" sortable prop="idEnginetype" align="center">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.idEnginetype }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.hostname')" sortable prop="specs" align="center">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.specs.hostname }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.port')" sortable prop="specs" align="center">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.specs.port }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" fixed="right" align="center" width="300" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            {{ $t('table.edit') }}
          </el-button>
          <el-button type="primary" class="w-auto" size="mini" @click="handleViewRuleManagement(row)">
            {{ $t('route.rules_management') }}
          </el-button>
          <el-button type="danger" size="mini" @click="handleDelete(row)">
            {{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column> 
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="params.page" :limit.sync="params.limit" @pagination="getList" />

    <!-- dialog edit, create -->
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

        <el-form-item label="Hostname" prop="specs">
          <el-input
            v-model="temp.specs.hostname"
            tabindex="1"
            @focus="resetError"
            name="hostname"
            :placeholder="$t('table.hostname')"
            :class="{ error: errors.has('hostname') }"
            data-vv-validate-on="change|blur"
            v-validate="'required|min:4|max:255'"
          />
        </el-form-item>

        <el-form-item label="Port" prop="specs">
          <el-input
            v-model="temp.specs.port"
            tabindex="1"
            @focus="resetError"
            name="port"
            :placeholder="$t('table.port')"
            :class="{ error: errors.has('port') }"
            data-vv-validate-on="change|blur"
            v-validate="'required|numeric|max:255'"
          />
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

    <!-- dialog rule -->
    <el-dialog title="Application Firewall Rule Management" :visible.sync="ruleManagementVisible" @close="resetError()">
      <div>
        <el-button class="r" size="medium" @click="uploadModalVisible = true">Upload</el-button>
      </div>
      <div class="clearfix"></div>
      <div><strong>Webserver type</strong></div>
      <div><strong>Modsercirity</strong></div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="ruleManagementVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
      </div>
    </el-dialog>

    <!-- dialog upload -->
    <el-dialog title="Upload Rule" :visible.sync="uploadModalVisible" @close="resetError()" width="400px">
      <el-form ref="uploadFromFile" :model="rule" label-position="left" label-width="70px" style="width: 100%;">
        <el-upload
              class="upload-student"
              drag
              ref="uploadexcel"
              action="/api/v1/student/upload"
              :file-list="fileList"
              :auto-upload="false">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">{{ $t('upload.dropFileHere') }} {{ $t('upload.or') }} <em>{{ $t('upload.clickToUpload') }}</em></div>
        </el-upload>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="uploadModalVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary"">
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

import { Validator } from 'vee-validate';
import i18n from '@/lang'

Validator.extend('is_json', {
  getMessage: () => i18n.t('notify.errors.invalid_json_format'),
  validate: value => {
    try {
      JSON.parse(value)
    } catch {
      return false
    }
    return true
  }
});

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
        specs: {
          hostname: '',
          port: ''
        }
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
      isSubmitting: false,
      ruleManagementVisible: false,
      uploadModalVisible: false,
      fileList: [],
      rule: {},
      hostCanView: {}
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
            name: res.name,
            idObject: res.idObject,
            specs: JSON.parse(res.specs)
          }
        })
        this.total = response.length
      })
      .catch(error => {
        console.log(error)
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
      // rf.getRequest('EngineRequest').create(this.temp)
      // .then(() => {
      //   this.dialogFormVisible = false
      //   this.$notify({
      //     title: this.$t('notify.success.label'),
      //     message: this.$t('notify.success.createSuccess'),
      //     type: 'success',
      //     duration: 1000,
      //     showClose: false
      //   })
      //   this.handleRefreshTable()
      // })
      // .catch(error => {
      //   this.handleError(error)
      // })

    },
    resetTemp() {
      this.temp = {
        idEngine: undefined,
        idEnginetype: '',
        name: '',
        specs: {
          hostname: '',
          port: ''
        }
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
      await this.$validator.validate('hostname');
      await this.$validator.validate('port');
      if (this.errors.any()) {
        return;
      }
      let params = window._.cloneDeep(this.temp)
      params = {
        ...params,
        specs: JSON.stringify(params.specs)
      }
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
        response.map((item, index) => {
          item.no = index + 1;
          item.specs = JSON.stringify(JSON.parse(item.specs));
          dataExport.push(item)
        })
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
      console.log(dataExport)
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = [this.$t('no'), this.$t('table.id'), this.$t('table.specs')]
        const filterVal = ['no', 'idEngine', 'specs']
        const data = this.formatJson(filterVal, dataExport)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: `${this.$t('route.engine_list')}`
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
    handleViewRuleManagement(row) {
      this.queryHost(row.idObject)
      this.ruleManagementVisible = true
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
    },

    queryHost (objectId) {
      rf.getRequest('ContainmentRelRequest').queryHost(objectId)
      .then((res) => {
        console.log(res)
        this.hostCanView = res.data
      })
    }
  },
}
</script>
