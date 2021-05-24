<template>
  <div class="app-container user-management">
    <div class="filter-container">
      <el-input style="width: 200px;"
                v-model="params.key"
                :placeholder="$t('table.key')"
                class="filter-item" 
                @keyup.enter.native="handleRefreshTable" />
      <el-button v-waves class="filter-item ml-1" type="primary" icon="el-icon-search" @click="handleRefreshTable">
        {{ $t('table.search') }}
      </el-button>
      <el-select style="width: 130px" 
                v-model="params.idEnginetype"
                class="filter-item ml-3"
                :placeholder="$t('table.status')"
                @change="handleRefreshTable"
                clearable >
        <el-option v-for="item in engineTypes" 
                  :key="item.idEnginetype" 
                  :label="item.name" 
                  :value="item.idEnginetype" />
      </el-select>
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
      <el-table-column :label="$t('table.idObject')" sortable prop="idObject" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.idObject }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.idEnginetype')" prop="idEnginetype" sortable align="center" width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.idEnginetype }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.name')" sortable prop="name" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.description')" sortable prop="description" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.hostname')" sortable prop="specs" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.specs.hostname }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.port')" sortable prop="specs" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.specs.port }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" fixed="right" align="center" width="200" class-name="small-padding">
        <template slot-scope="{row}">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="handleUpdate(row)" :title="$t('table.edit')">
          </el-button>
          <el-button type="primary" size="mini" @click="handleDetail(row)" :title="$t('table.edit')">
            <svg-icon icon-class="eye-open" />
          </el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" :title="$t('table.delete')" @click="handleDelete(row)">
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="params.page" :limit.sync="params.limit" @pagination="getList" />
    <DialogIps :objectCanView="rowCanView" v-if="!isEmpty(rowCanView)" :dialogVisible="dialogVisible" @close="handleClose" @detail="detailIps"></DialogIps>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" @close="resetError()">
      <el-form ref="dataFormSingle" :model="temp" label-position="left" label-width="100px" style="width: 100%">
        <el-form-item :label="$t('table.name')" prop="name">
          <el-input v-model="temp.name"
                    tabindex="1"
                    @focus="resetError"
                    name="name"
                    :placeholder="$t('table.name')"
                    :class="{ error: errors.has('name') }"
                    data-vv-validate-on="none"
                    v-validate="'required|min:2|max:255'"  />
          <div class="el-form-item__error" v-if="errors.has('name')">
            {{ errors.first('name') }}
          </div>
        </el-form-item>
<!--         <el-form-item :label="$t('table.description')">
          <el-input v-model="temp.description"
                    tabindex="1"
                    @focus="resetError"
                    name="description"
                    :placeholder="$t('table.description')"
                    :class="{ error: errors.has('description') }"
                    data-vv-validate-on="none"
                    v-validate="'required|min:4|max:255'" />
          <div class="el-form-item__error" v-if="errors.has('description')">
            {{ errors.first('description') }}
          </div>
        </el-form-item>
        <el-form-item :label="$t('table.engine_type')">
          <el-select
                v-model="temp.idEnginetype"
                class="filter-item"
                tabindex="1"
                @focus="resetError"
                name="engine-type"
                :placeholder="$t('table.engine_type')"
                :class="{ error: errors.has('engine-type') }"
                data-vv-validate-on="none"
                v-validate="'required'"
                clearable >
            <el-option v-for="item in engineTypes"
                  :key="item.idEnginetype" 
                  :label="item.name" 
                  :value="item.idEnginetype" />
          </el-select>
          <div class="el-form-item__error" v-if="errors.has('engine-type')">
            {{ errors.first('engine-type') }}
          </div>
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="updateData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import rf from 'requestfactory'
import { Message } from 'element-ui'
import RemoveErrorsMixin from 'common/RemoveErrorsMixin'
import { statusDeduce } from '../../utils'
import DialogIps from './DialogIps'
import { isEmpty, map, cloneDeep } from 'lodash'

export default {
  name: 'IpsList',
  components: {
    Pagination,
    DialogIps
  },
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
        status: undefined,
        sort: 'updated_at',
        order: 'desc'
      },
      temp: {
        name: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: this.$t('table.edit'),
        create: this.$t('table.create'),
        upload: this.$t('upload.title')
      },
      fileList: [],
      isSubmitting: false,
      engineTypes: [],
      rowCanView: {},
      dialogVisible: false
    }
  },
  async mounted() {
    this.params.idEnginetype = this.$route.query.idEnginetype
    await this.loadEngineTypes()
  },
  methods: {
    loadEngineTypes() {
      let params = {}
      rf.getRequest('EngineTypeRequest').getList(params)
      .then(async response => {
        await this.getList()
        this.engineTypes = map(response, engineType => {
          return {
            idEnginetype: engineType.idEnginetype,
            name: engineType.name,
            value: engineType.name,
            description: engineType.description
          }
        })
        this.options = cloneDeep(response)
      })
      .catch(error => {
        this.errors.add({field: 'error', msg: error.response.data.message});
        Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
      });
    },
    getList() {
      rf.getRequest('ContainmentRelRequest').getIpsList(this.params)
      .then(async response => {
        if (this.params.idEnginetype) {
          response = response.filter(item => item.idEnginetype === this.params.idEnginetype);
        }
        this.list = response.map(item => ({
          ...item,
          specs: JSON.parse(item.specs)
        }))
        this.total = response.length
      })
      .catch(error => {
        console.log(error)
        this.errors.add({field: 'error', msg: error.response.data.message});
        Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
      })
      .finally(() => this.listLoading = false)
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
    resetTemp() {
      this.temp = {
        name: ''
      }
    },
    handleUpdate(row) {
      row = {
        ...row
      }
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.rowCanView = row
    },
    isEmpty(value) {
      return !!isEmpty(value)
    },
    async handleDetail(row) {
      rf.getRequest('ContainmentRelRequest').checkHostStatus(row.idObject)
        .then(res => {
          const status = statusDeduce(res) || status;
          const serviceStates = JSON.parse(res.data);

          this.rowCanView = {
            ...row,
            idContainer: row.idObject,
            children: [],
            name: row.name || row.idContainee,
            description: row.description,
            status,
            serviceStates,
            online: res.online || false,
            enabled: res.enabled || false
          }
        })
        .then(() => {
          this.dialogVisible = true
        })
    },
    async updateData() {
      this.resetError();
      if (this.isSubmitting) {
        return;
      }
      await this.$validator.validate('name');
      if (this.errors.any()) {
        return;
      }
      let params = cloneDeep(this.temp)
      rf.getRequest('ContainmentRelRequest').update(this.rowCanView.idObject, params)
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
    handleDelete(row) {
      this.$confirm(this.$t('notify.text.delete'), 'Warning', {
        confirmButtonText: this.$t('action.ok'),
        cancelButtonText: this.$t('action.cancel'),
        type: 'warning',
        center: true
      }).then(() => {
        rf.getRequest('ContainmentRelRequest').delete(row.idObject)
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
    handleClose () {
      this.dialogVisible = false
      this.rowCanView = {}
    },
    detailIps () {
      this.dialogVisible = false
      this.$router.push({ name: 'HostOverviewECS', params: { hostname: this.rowCanView.specs.hostname } })
    }
  },
}
</script>
