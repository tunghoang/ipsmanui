<template>
  <div class="app-container role-management">
    <div class="filter-container">
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
      <el-table-column :label="$t('table.id')" prop="idRole" sortable align="center" width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.idPermission }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.role_name')" sortable prop="roleName" align="center">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.roleName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.object_name')" sortable prop="objectName" align="center">
        <template slot-scope="scope" v-if="scope.row.idObject !== null">
          <span v-if="scope.row.idEngine === null" :title="$t('table.node')">
            <svg-icon class-name="pc-icon size-1_5" icon-class="pc" />
          </span>
          <span v-else :title="$t('table.group')">
            <svg-icon class-name="group-icon size-1_5" icon-class="group" />
          </span>
          <span class="el-link--info ml-2">{{ scope.row.objectName }}</span>
        </template>
        <template v-else>
          <span></span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.action')" sortable prop="action" align="center">
        <template slot-scope="scope">
          <span class="el-link--info">{{ scope.row.action }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" fixed="right" align="center" width="100" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="danger" size="mini" @click="handleDelete(row)">
            {{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column> 
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="params.page" :limit.sync="params.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" @close="resetError()">
      <el-form ref="dataFormSingle" :model="temp" label-position="left" label-width="100px" style="width: 100%">
        <el-form-item :label="$t('table.object')" prop="idObject">
          <el-select v-model="temp.idObject" class="filter-item" placeholder="Please select">
            <el-option :key="0" :label="$t('table.not_interactive_object')" value="" selected/>
            <el-option v-for="item in objects" :key="item.idObject" :label="item.name" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('table.action')" prop="action" v-if="temp.idObject">
          <el-select
            v-model="temp.action"
            class="filter-item" 
            tabindex="1"
            @focus="resetError"
            name="action"
            :placeholder="$t('select.action')"
            :class="{ error: errors.has('action') }"
            data-vv-validate-on="none"
            v-validate="'required'">
            <el-option v-for="item in actionObjectList" :key="item.value" :label="item.name" :value="item.value" />
          </el-select>
          <div class="el-form-item__error" v-if="errors.has('action')">
            {{ errors.first('action') }}
          </div>
        </el-form-item>
        <el-form-item :label="$t('table.action')" prop="action" v-else>
          <el-select
            v-model="temp.action"
            class="filter-item"
            tabindex="1"
            @focus="resetError"
            name="action"
            :placeholder="$t('select.action')"
            :class="{ error: errors.has('action') }"
            data-vv-validate-on="none"
            v-validate="'required'">
            <el-option v-for="item in actionList" :key="item.value" :label="item.name" :value="item.value" />
          </el-select>
          <div class="el-form-item__error" v-if="errors.has('action')">
            {{ errors.first('action') }}
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="createData()">
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
import { map, isEmpty, cloneDeep } from 'lodash'
const actionList = [
  {
    name: window.i18n.t('table.create_group'),
    value: 'create-group'
  },
  {
    name: window.i18n.t('table.create_node'),
    value: 'create-node'
  },
  {
    name: window.i18n.t('table.create_role'),
    value: 'create-role'
  },
  {
    name: window.i18n.t('table.create_user'),
    value: 'create-user'
  },
]
const actionObjectList = [
  {
    name: window.i18n.t('table.update'),
    value: 'update'
  },
  {
    name: window.i18n.t('table.read'),
    value: 'read'
  }
]

export default {
  name: 'PermissionOfRole',
  components: { Pagination },
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
        idRole: null,
        sort: 'updated_at',
        order: 'desc'
      },
      temp: {
        idRole: undefined,
        idObject: '',
        action: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: this.$t('table.edit'),
        create: this.$t('table.create'),
        upload: this.$t('upload.title')
      },
      roles: [],
      objects: [],
      fileList: [],
      actionList,
      actionObjectList,
      isSubmitting: false
    }
  },
  async created() {
    this.params.idRole = this.$route.params.id
    this.temp.idRole = this.$route.params.id
  },
  async mounted() {
    await this.loadRoles()
  },
  watch: {
    'temp.idObject' () {
      this.temp.action = ''
    }
  },
  methods: {
    loadRoles() {
      let params = {}
      rf.getRequest('RoleRequest').getList(params)
      .then(async response => {
        this.roles = map(response, role => {
          return {
            idRole: role.idRole,
            value: role.name,
            name: role.name
          }
        })
        await this.loadObjects()
      })
      .catch(error => {
        this.errors.add({field: 'error', msg: error.response.data.message});
        Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
      })
    },
    loadObjects() {
      let params = {}
      rf.getRequest('ContainmentRelRequest').allObjects(params)
      .then(async response => {
        this.objects = map(response, object => {
          return {
            idObject: object.idObject,
            value: object.idObject,
            name: object.name
          }
        })
        await this.getList()
      })
      .catch(error => {
        this.errors.add({field: 'error', msg: error.response.data.message});
        Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
      })
    },
    getList() {
      rf.getRequest('PermissionRequest').find(this.params)
      .then(async response => {
        this.list = response
        this.total = response.length
      })
      .catch(error => {
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
      await this.$validator.validate('action');
      if (this.errors.any()) {
        return;
      }
      const params = cloneDeep(this.temp)
      if(isEmpty(`${this.temp.idObject}`)) {
        delete params.idObject
      }
      rf.getRequest('PermissionRequest').create(params)
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
        idRole: this.$route.params.id,
        idObject: '',
        action: ''
      }
    },
    handleDelete(row) {
      this.$confirm(this.$t('notify.text.delete'), 'Warning', {
        confirmButtonText: this.$t('action.ok'),
        cancelButtonText: this.$t('action.cancel'),
        type: 'warning',
        center: true
      }).then(() => {
        rf.getRequest('PermissionRequest').delete(row.idPermission)
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
          message: this.$t('notify.info.cancel')
        })
      })
    }
  },
}
</script>
