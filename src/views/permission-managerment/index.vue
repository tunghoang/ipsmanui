<template>
  <div class="app-container role-managerment">
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
        <template slot-scope="scope">
          <span v-if="scope.row.idEngine === null" :title="$t('table.node')">
            <svg-icon class-name="pc-icon size-1_5" icon-class="pc" />
          </span>
          <span v-else :title="$t('table.group')">
            <svg-icon class-name="group-icon size-1_5" icon-class="group" />
          </span>
          <span class="el-link--info ml-2">{{ scope.row.objectName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.action')" sortable prop="action" align="center">
        <template slot-scope="scope">
          <span class="el-link--info">{{ scope.row.action }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="params.page" :limit.sync="params.limit" @pagination="getList" />

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
        <el-form-item :label="$t('table.description')">
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
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import rf from 'requestfactory'
import { Message } from 'element-ui'
import RemoveErrorsMixin from 'common/RemoveErrorsMixin'

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
        idRole: 1,
        sort: 'updated_at',
        order: 'desc'
      },
      temp: {
        idRole: undefined,
        name: '',
        description: ''
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
      isSubmitting: false
    }
  },
  async created() {
    await this.getList()
  },
  async mounted() {
    await this.loadRoles()
  },
  methods: {
    loadRoles() {
      let params = {}
      rf.getRequest('RoleRequest').getList(params)
      .then(async response => {
        this.roles = window._.map(response, role => {
          return {
            idRole: role.idRole,
            value: role.name,
            name: role.name
          }
        })
        await this.loadObjects()
        this.options = window._.cloneDeep(response)
      })
      .catch(error => {
        this.errors.add({field: 'error', msg: error.response.data.message});
        Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
      })
    },
    loadObjects() {
      let params = {}
      rf.getRequest('ContainmentRelRequest').getList(params)
      .then(async response => {
        this.objects = window._.map(response, role => {
          return {
            idRole: role.idObject,
            value: role.name,
            name: role.name
          }
        })
        this.options = window._.cloneDeep(response)
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
      await this.$validator.validate('name');
      await this.$validator.validate('description');
      if (this.errors.any()) {
        return;
      }
      rf.getRequest('PermissionRequest').create(this.temp)
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
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    beforeRemove(file) {
      return this.$confirm(`Cancel the transfert of ${ file.name } ?`);
    },
    resetTemp() {
      this.temp = {
        idRole: undefined,
        name: '',
        description: ''
      }
    },
  },
}
</script>
