<template>
  <div class="app-container student">
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
      <el-autocomplete
                v-model="params.university"
                class="filter-item"
                value="name"
                clearable
                @select="handleRefreshTable()"
                :fetch-suggestions="querySearchAsync"
                @keyup.enter.native="handleRefreshTable"
                :placeholder="$t('table.university')">
        <template slot-scope="{ item }">
          <span class="value">{{ item.value }} ({{ item.name }})</span>
        </template>
      </el-autocomplete>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleRefreshTable">
        {{ $t('table.search') }}
      </el-button>
      <el-checkbox v-model="showTime" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        {{ $t('table.updatedAt') }}
      </el-checkbox>
    </div>
    <div class="filter-container">
      <el-button v-waves :loading="isSubmitting" style="margin-left: 10px; float: right;" class="filter-item float-right" type="primary" icon="el-icon-download" @click="handleDownload">
        {{ $t('table.export') }}
      </el-button>
      <template  v-if="deleteList.length <= 0">
        <el-dropdown split-button type="primary" style="float: right;">
          {{ $t('table.add') }}
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item><div @click="handleCreateSingle">{{ $t('student.addSingle') }}</div></el-dropdown-item>
            <el-dropdown-item><div @click="handleCreateFromFile">{{ $t('student.addFromFile') }}</div></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
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
      <el-table-column :label="$t('student.username')" sortable prop="username" width="120px" align="center">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.name')" sortable prop="full_name" min-width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.full_name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.email')" sortable prop="email" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.email }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.university')" width="250px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.university_name }} ({{ scope.row.university_short_name }})</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.status')" width="90px" align="center">
        <template slot-scope="{row}">
          <el-tag>{{ row.status | typeFilter }}</el-tag>
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
        <el-form-item :label="$t('table.username')" prop="username">
          <el-input v-model="temp.username"
                    tabindex="1"
                    autocomplete="on"
                    @focus="resetError"
                    name="username"
                    :placeholder="$t('table.username')"
                    :class="{ error: errors.has('username') }"
                    data-vv-validate-on="none"
                    v-validate="'required|min:8|max:255'"  />
          <div class="el-form-item__error" v-if="errors.has('username')">
            {{ errors.first('username') }}
          </div>
        </el-form-item>
        <el-form-item :label="$t('table.name')" prop="full_name">
          <el-input v-model="temp.full_name"
                    tabindex="1"
                    autocomplete="on"
                    @focus="resetError"
                    name="full_name"
                    :placeholder="$t('table.name')"
                    :class="{ error: errors.has('full_name') }"
                    data-vv-validate-on="none"
                    v-validate="'required|min:8|max:255'" />
          <div class="el-form-item__error" v-if="errors.has('full_name')">
            {{ errors.first('full_name') }}
          </div>
        </el-form-item>
        <el-form-item :label="$t('table.email')" prop="email">
          <el-input v-model="temp.email"
                    tabindex="1"
                    autocomplete="on"
                    @focus="resetError"
                    name="email"
                    :placeholder="$t('table.email')"
                    :class="{ error: errors.has('email') }"
                    data-vv-validate-on="none"
                    v-validate="'required|min:8|max:255'" />
          <div class="el-form-item__error" v-if="errors.has('email')">
            {{ errors.first('email') }}
          </div>
        </el-form-item>
        <el-form-item :label="$t('table.status')" prop="status">
          <el-select v-model="temp.status" class="filter-item" placeholder="Please select">
            <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormFileVisible" @close="resetError()">
      <el-form ref="uploadFromFile" :model="temp" label-position="left" label-width="70px" style="width: 100%;">
        <el-upload
              class="upload-student"
              drag
              ref="uploadexcel"
              action="/api/v1/student/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :file-list="fileList"
              :auto-upload="false">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">{{ $t('upload.dropFileHere') }} {{ $t('upload.or') }} <em>{{ $t('upload.clickToUpload') }}</em></div>
          <div class="el-upload__tip" slot="tip">{{ $t('upload.file') }}: xlsx/csv</div>
        </el-upload>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormFileVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="createDataFromFile()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
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

const ACTIVE = 'active'
const calendarTypeOptions = [
  { key: 'active', display_name: window.i18n.t('table.active') },
  { key: 'inactive', display_name: window.i18n.t('table.inactive') },
]

const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'Student',
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
    },
    shortNameToName: function (shortName, array) {
      if (window._.isEmpty(shortName)) {
        return ''
      }
      let data = array.filter(item => {
        return (item.value == shortName);
      });
      return  data ? data[0].name : ''
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
        order: 'desc',
        university: null
      },
      calendarTypeOptions,
      showTime: false,
      temp: {
        id: undefined,
        username: '',
        full_name: '',
        email: '',
        status: 'active'
      },
      dialogFormVisible: false,
      dialogFormFileVisible: false,
      dialogStatus: '',
      textMap: {
        update: this.$t('table.edit'),
        create: this.$t('table.create'),
        upload: this.$t('upload.title')
      },
      deleteList: [],
      fileList: [],
      isSubmitting: false
    }
  },
  watch: {
    'params.university': {
      handler: function (after) {
        if (window._.isEmpty(after)) {
          this.handleRefreshTable()
        }
      },
    }
  },
  // created() {
  //   if(this.$route.query.university !== undefined ) {
  //     this.params.university = this.$route.params.university;
  //   }
  //   this.getList()
  // },
  mounted() {
    if(this.$route.query.university !== undefined ) {
      this.params.university = this.$route.query.university;
    }
    this.getList()
    this.loadUniversities();
  },
  methods: {
    loadUniversities() {
      let params = {
        status: ACTIVE
      }
      rf.getRequest('UniversityRequest').getSummaryOfTheUniversity(params)
      .then(async response => {
        this.universities = response.data
        this.options = window._.cloneDeep(response.data)
      })
      .catch(error => {
        this.errors.add({field: 'error', msg: error.response.data.message});
        Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
      });
    },
    querySearchAsync(queryString, cb) {
      var universities = this.universities;
      var results = queryString ? universities.filter(this.createFilter(queryString)) : universities;

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
    handleSelect(item) {
      console.log(item);
    },
    getList() {
      rf.getRequest('StudentRequest').getList(this.params)
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
    handleCreateFromFile() {
      this.resetTemp()
      this.dialogStatus = 'upload'
      this.dialogFormFileVisible = true
      this.$nextTick(() => {
        this.$refs['uploadFromFile'].clearValidate()
      })
    },
    createDataFromFile() {
      this.$refs.uploadexcel.submit();
      this.$notify({
        title: this.$t('notify.success.label'),
        message: this.$t('notify.success.createSuccess'),
        type: 'success',
        duration: 1000,
        showClose: false
      })
    },
    async createData() {
      this.resetError();
      if (this.isSubmitting) {
        return;
      }
      await this.$validator.validate('username');
      await this.$validator.validate('full_name');
      await this.$validator.validate('email');
      if (this.errors.any()) {
        return;
      }
      rf.getRequest('StudentRequest').create(this.temp)
      .then(() => {
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
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    handleExceed(files, fileList) {
      this.$message.warning(`The limit is 3, you selected ${files.length} files this time, add up to ${files.length + fileList.length} totally`);
    },
    beforeRemove(file) {
      return this.$confirm(`Cancel the transfert of ${ file.name } ?`);
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        username: '',
        full_name: '',
        email: '',
        status: 'active'
      }
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
    },
    updateData() {
      this.dialogFormVisible = false
      this.$notify({
        title: this.$t('notify.success.label'),
        message: this.$t('notify.success.updateSuccess'),
        type: 'success',
        duration: 1000,
        showClose: false
      })
    },
    handleDownload() {
      this.isSubmitting = true
      rf.getRequest('StudentRequest').export(this.params)
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
        const tHeader = [this.$t('no'), this.$t('table.username'), this.$t('table.name'), this.$t('table.email')]
        const filterVal = ['no', 'username', 'full_name', 'email']
        const data = this.formatJson(filterVal, dataExport)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: `${this.$t('route.student')}-${this.$options.filters.shortNameToName(this.params.university, this.universities)}`
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
        const index = this.list.indexOf(row)
        this.list.splice(index, 1)
        this.$message({
          type: 'success',
          message: this.$t('notify.success.deleteSuccess'),
        });
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
<style lang="scss">
  .student {
    .el-dialog {
        max-width: 500px;
      }
    .upload-student {
      .el-upload.el-upload--text {
        width: 100%;
        .el-upload-dragger {
          width: 100%;
        }
      }
    }
  }
  @media screen and (max-width: 768px) {
    .student {
      .el-dialog {
        width: 80%;
      }
    }
  }
  @media screen and (max-width: 546px) {
    .student {
      .el-dialog {
        width: 96%;
      }
    }
  }
</style>
