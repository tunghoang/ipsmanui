<template>
  <div class="app-container role-management">
    <div class="filter-container">
      <el-input style="width: 200px;"
                v-model="params.key"
                :placeholder="$t('table.key')"
                class="filter-item" 
                @keyup.enter.native="handleRefreshTable" />
      <el-button v-waves class="filter-item ml-1" type="primary" icon="el-icon-search" @click="handleRefreshTable">
        {{ $t('table.search') }}
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
      <el-table-column :label="$t('table.id')" prop="idRole" sortable align="center" width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.idRole }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.name')" sortable prop="name" align="center">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.description')" sortable prop="description" align="center">
        <template slot-scope="scope">
          <span class="el-link--info" @click="handleUpdate(scope.row)">{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" fixed="right" align="center" width="200" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <div class="d-flex">
            <el-button type="primary" icon="el-icon-user-solid" size="mini" class="w-auto" @click="$router.push({ name: 'UsersOfRole', params: { id: row.idRole } })" :title="$t('table.all_user')">
            </el-button>
            <el-button type="primary" icon="el-icon-edit-outline" size="mini" class="w-auto" @click.native="$router.push({ name: 'PermissionOfRole', params: { id: row.idRole } })" :title="$t('table.edit_permission')">
            </el-button>
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="handleUpdate(row)" :title="$t('table.edit')">
            </el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="handleDelete(row)" :title="$t('table.delete')">
            </el-button>
          </div>
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
import { cloneDeep } from 'lodash'

export default {
  name: 'UserList',
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
        key: undefined,
        status: undefined,
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
      fileList: [],
      isSubmitting: false
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    getList() {
      rf.getRequest('RoleRequest').getList(this.params)
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
      rf.getRequest('RoleRequest').create(this.temp)
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
      await this.$validator.validate('name');
      await this.$validator.validate('description');
      if (this.errors.any()) {
        return;
      }
      let params = cloneDeep(this.temp)
      rf.getRequest('RoleRequest').update(params.idRole, params)
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
        rf.getRequest('RoleRequest').delete(row.idRole)
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
