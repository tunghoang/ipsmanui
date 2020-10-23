<template>
  <div class="app-container university">
    <div class="filter-container">
      <el-input style="width: 200px;"
                v-model="params.key"
                :placeholder="$t('table.key')"
                class="filter-item" 
                @keyup.enter.native="handleRefreshTable" />
      <el-select style="width: 130px" 
                v-model="params.status"
                class="filter-item"
                :placeholder="$t('table.status')"
                @change="handleRefreshTable"
                clearable >
        <el-option v-for="item in calendarTypeOptions" 
                  :key="item.key" 
                  :label="`${item.display_name}`+' ('+item.key+')'" 
                  :value="item.key" />
      </el-select>
      <el-checkbox v-model="showTime" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        {{ $t('table.updatedAt') }}
      </el-checkbox>
      <el-button v-waves :loading="isSubmitting" style="margin-left: 10px; float: right;" class="filter-item float-right" type="primary" icon="el-icon-download" @click="handleDownload">
        {{ $t('table.export') }}
      </el-button>
      <template  v-if="deleteList.length <= 0">
        <el-button style="float: right;" class="filter-item float-right" type="primary" icon="el-icon-plus" @click="handleCreateSingle">
          {{ $t('table.add') }}
        </el-button>
        </template>
      <template v-else>
        <el-button  style="float: right;" class="filter-item float-right" type="danger" icon="el-icon-delete" @click="handleDelete">
          {{ $t('table.delete') }}
        </el-button>
      </template>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      fit
      stripe
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
    <el-table-column
      type="selection"
      fixed
      width="45">
    </el-table-column>
      <el-table-column :label="$t('table.id')" prop="id" sortable align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.name')" sortable prop="name" min-width="250px" align="center">
        <template slot-scope="scope">
          <el-dropdown split-button type="info">
            <!-- <span class="el-dropdown-link">
              <span class="link-type">{{ scope.row.name }}</span>
            </span> -->
              {{ scope.row.name }}
            <el-dropdown-menu slot="dropdown">
              <router-link :to="{ name: 'Student', query: { university: scope.row.short_name } }">
                <el-dropdown-item icon="el-icon-s-custom">
                  {{ $t('route.student') }}
                </el-dropdown-item>
              </router-link>
              <router-link :to="{ name: 'Semester', query: { university: scope.row.short_name } }">
                <el-dropdown-item icon="el-icon-s-order">
                  {{ $t('route.semester') }}
                </el-dropdown-item>
              </router-link>
              <router-link :to="{ name: 'Room', query: { university: scope.row.short_name } }">
                <el-dropdown-item icon="el-icon-s-home">
                  {{ $t('route.room') }}
                </el-dropdown-item>
              </router-link>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.shortName')" sortable prop="short_name" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.short_name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.status')" width="90px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status == 'active' ? '' : 'danger'">{{ row.status | typeFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.updatedAt')" sortable prop="updated_at" v-if="showTime" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.updated_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
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
      <el-form ref="dataFormSingle" :model="temp" label-position="left" label-width="100px" style="width: 100%">
        <el-form-item :label="$t('table.name')" prop="name">
          <el-input v-model="temp.name"
                    tabindex="1"
                    autocomplete="on"
                    @focus="resetError"
                    name="name"
                    :placeholder="$t('table.name')"
                    :class="{ error: errors.has('name') }"
                    data-vv-validate-on="none"
                    v-validate="'required|min:8|max:255'"  />
          <div class="el-form-item__error" v-if="errors.has('name')">
            {{ errors.first('name') }}
          </div>
        </el-form-item>
        <el-form-item :label="$t('table.shortName')" prop="short_name">
          <el-input v-model="temp.short_name"
                    tabindex="1"
                    autocomplete="on"
                    @focus="resetError"
                    name="short_name"
                    :placeholder="$t('table.shortName')"
                    :class="{ error: errors.has('short_name') }"
                    data-vv-validate-on="none"
                    v-validate="'required|min:2|max:8'" />
          <div class="el-form-item__error" v-if="errors.has('short_name')">
            {{ errors.first('short_name') }}
          </div>
        </el-form-item>
        <el-form-item :label="$t('table.status')" prop="status">
          <el-select v-model="temp.status" class="filter-item" placeholder="Please select">
            <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" :selected="item.key == temp.status" />
          </el-select>
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

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import rf from 'requestfactory'
import { Message } from 'element-ui'
import RemoveErrorsMixin from 'common/RemoveErrorsMixin';


const calendarTypeOptions = [
  { key: 'active', display_name: window.i18n.t('table.active') },
  { key: 'inactive', display_name: window.i18n.t('table.inactive') },
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'University',
  components: { Pagination },
  directives: { waves },
  mixins: [RemoveErrorsMixin],
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(status) {
      return calendarTypeKeyValue[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      universities: [],
      timeout:  null,
      params: {
        page: 1,
        limit: 20,
        key: undefined,
        status: undefined,
        sort: 'updated_at',
        order: 'desc'
      },
      calendarTypeOptions,
      showTime: false,
      temp: {
        id: undefined,
        name: '',
        short_name: '',
        status: 'active'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: this.$t('table.edit'),
        create: this.$t('table.create'),
        upload: this.$t('upload.title')
      },
      deleteList: [],
      dialogPvVisible: false,
      pvData: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      rf.getRequest('UniversityRequest').getList(this.params)
      .then(async response => {
        this.listLoading = false
        this.list = response.data.items
        this.total = response.data.total
      })
      .catch(error => {
        this.errors.add({field: 'error', msg: error.response.data.message});
        Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
      });
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
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    handleSelectionChange(val) {
      this.deleteList = []
      val.forEach((v) => {
        this.deleteList.push(v.id)
      });
      this.multipleSelection = val;
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
      this.handleRefreshTable()
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
      await this.$validator.validate('short_name');
      if (this.errors.any()) {
        return;
      }
      rf.getRequest('UniversityRequest').create(this.temp)
      .then(async () => {
        this.handleRefreshTable()
        this.dialogFormVisible = false
        this.$notify({
          title: this.$t('notify.success.label'),
          message: this.$t('notify.success.createSuccess'),
          type: 'success',
          duration: 1000,
          showClose: false
        })
      })
      .catch(error => {
        this.handleError(error)
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        short_name: '',
        status: 'active'
      }
      this.resetError()
    },
    handleUpdate(row) {
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
      await this.$validator.validate('short_name');
      if (this.errors.any()) {
        return;
      }
      rf.getRequest('UniversityRequest').update(this.temp)
      .then(async() => {
        this.handleRefreshTable()
        this.dialogFormVisible = false
        this.$notify({
          title: this.$t('notify.success.label'),
          message: this.$t('notify.success.updateSuccess'),
          type: 'success',
          duration: 1000,
          showClose: false
        })
      })
      .catch(error => {
        this.handleError(error)
      })
    },
    handleDownload() {
      this.isSubmitting = true
      rf.getRequest('UniversityRequest').export(this.params)
      .then(async response => {
        let dataExport = []
        response.data.map((item, index) => {item.no = index + 1 ; dataExport.push(item)})
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
        const tHeader = [this.$t('no'), this.$t('name'), this.$t('short_name')]
        const filterVal = ['no', 'name', 'short_name']
        const data = this.formatJson(filterVal, dataExport)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: `${this.$t('route.university')}`
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
      if (row.id != undefined) {
        this.deleteList.push(row.id)
      }
      this.$confirm(this.$t('notify.text.delete'), 'Warning', {
        confirmButtonText: this.$t('action.ok'),
        cancelButtonText: this.$t('action.cancel'),
        type: 'warning',
        center: true
      }).then(() => {
        rf.getRequest('UniversityRequest').delete(this.deleteList)
        .then(async() => {
          this.handleRefreshTable()
          this.$notify({
            title: this.$t('notify.success.label'),
            message: this.$t('notify.success.deleteSuccess'),
            type: 'success',
            duration: 1000,
            showClose: false
          })
        })
        .catch(error => {
          this.handleError(error)
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: this.$t('notify.info.cancel'),
        });
      })
      .finally(() => { this.deleteList = [] });
    }
  },
}
</script>
<style lang="scss">
  .university {
    .el-dialog {
        max-width: 500px;
      }
    .upload-university {
      .el-upload.el-upload--text {
        width: 100%;
        .el-upload-dragger {
          width: 100%;
        }
      }
    }
  }
  @media screen and (max-width: 768px) {
    .university {
      .el-dialog {
        width: 80%;
      }
    }
  }
  @media screen and (max-width: 546px) {
    .university {
      .el-dialog {
        width: 96%;
      }
    }
  }
</style>
