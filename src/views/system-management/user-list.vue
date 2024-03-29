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
      <el-table-column :label="$t('table.id')" prop="idUser" sortable align="center" width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.idUser }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.username')" sortable prop="username" align="center">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" fixed="right" align="center" width="270" class-name="small-padding">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click.native="$router.push({ name: 'RoleOfUser', params: { id: row.idUser } })" icon="el-icon-edit-outline" :title="$t('table.edit_role')">
          </el-button>
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="handleUpdate(row)" :title="$t('table.edit')">
            </el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="handleDelete(row)" :title="$t('table.delete')">
            </el-button>
        </template>
      </el-table-column> 
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="params.page" :limit.sync="params.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" @close="resetError()">
      <el-form ref="dataFormSingle" :model="temp" label-position="left" label-width="150px" style="width: 100%">
        <el-form-item :label="$t('table.username')" prop="username">
          <el-input v-model="temp.username"
                    tabindex="1"
                    @focus="resetError"
                    name="username"
                    :placeholder="$t('table.username')"
                    :class="{ error: errors.has('username') }"
                    data-vv-validate-on="none"
                    v-validate="'required|min:2|max:255'"  />
          <div class="el-form-item__error" v-if="errors.has('username')">
            {{ errors.first('username') }}
          </div>
        </el-form-item>
        <el-form-item :label="$t('table.change_password')" v-if="dialogStatus !== 'create'">
          <el-switch v-model="changePassword" />
        </el-form-item>
        <el-form-item :label="$t('table.password')" v-if="dialogStatus === 'create' || changePassword">
          <el-input v-model="temp.password"
                    tabindex="1"
                    show-password
                    @focus="resetError"
                    name="password"
                    :placeholder="$t('table.password')"
                    :class="{ error: errors.has('password') }"
                    data-vv-validate-on="none"
                    v-validate="'required|min:4|max:255'" />
          <div class="el-form-item__error" v-if="errors.has('password')">
            {{ errors.first('password') }}
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
      changePassword: false,
      temp: {
        idUser: undefined,
        username: '',
        password: ''
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
      rf.getRequest('UserRequest').getList(this.params)
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
      await this.$validator.validate('username');
      await this.$validator.validate('password');
      if (this.errors.any()) {
        return;
      }
      rf.getRequest('UserRequest').create(this.temp)
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
        idUser: undefined,
        username: '',
        password: ''
      }
    },
    handleUpdate(row) {
      row = {
        ...row,
        password: ''
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
      await this.$validator.validate('username');
      await this.$validator.validate('password');
      if (this.errors.any()) {
        return;
      }
      let params = cloneDeep(this.temp)
      if(!this.changePassword) {
        delete params.password
      }
      rf.getRequest('UserRequest').update(params.idUser, params)
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
        return rf.getRequest('UserRequest').delete(row.idUser);
      }).then((res) => {
        console.log(res);
        this.$message({
          type: 'success',
          message: this.$t('notify.success.deleteSuccess')
        });
        this.handleRefreshTable()
      }).catch((error) => {
        console.log("Error in delete");
        console.log(error);
        this.$message({
          type: 'error',
          message: ((error.response || {}).data || {}).message || error.message,
        });
        /*this.errors.add({field: 'error', msg: error.response.data.message});
        Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))*/
      });
    }
  },
}
</script>
