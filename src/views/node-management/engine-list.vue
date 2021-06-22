<template>
  <div class="app-container user-management">
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
          <span class="link-type" @click="handleUpdate(scope.row)">{{ engineTypeLabel(scope.row.idEnginetype, engineTypes) }}</span>
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
      <el-table-column :label="$t('table.actions')" fixed="right" align="center" width="300" class-name="small-padding">
        <template slot-scope="{row}">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="handleUpdate(row)" :title="$t('table.edit')">
          </el-button>
          <!--<el-button type="primary" icon="el-icon-edit-outline" class="w-auto" size="mini" :disabled="!row.idObject" @click="handleViewRuleManagement(row)" :title="$t('route.rules_management')">-->
          <el-button type="primary" icon="el-icon-edit-outline" class="w-auto" size="mini" :disabled="!row.idObject" @click="$router.push({name: 'NodeRuleset', params: {idObject: row.idObject}})" :title="$t('route.rules_management')">
          </el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" :title="$t('table.delete')" @click="handleDelete(row)">
          </el-button>
        </template>
      </el-table-column> 
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="params.page" :limit.sync="params.limit" @pagination="getList" />

    <!-- dialog edit, create -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" @close="resetError()" width="30%">
      <el-form ref="dataFormSingle" :model="temp" label-position="left" label-width="120px" style="width: 100%">
        <el-form-item :label="$t('table.engine_type')" prop="idEnginetype">
          <el-select
                v-model="temp.idEnginetype"
                class="filter-item"
                placeholder="Please select"
                name="enginetype"
                @focus="resetError"
                :class="{ error: errors.has('enginetype') }"
                data-vv-validate-on="none"
                style="width:100%"
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
        <el-button type="primary">
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
import { map, cloneDeep } from 'lodash'
import RemoveErrorsMixin from 'common/RemoveErrorsMixin'
import { engineTypeLabel } from '@/misc';

export default {
  name: 'EngineList',
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
      rulePackages: [],
      uploadModalVisible: false,
      rule: {},
      hostCanView: {},
      inputVisible: false,
      inputValue: '',
      selectedRow: {},
      submitRulesetLoading: false,
      rulesetOptions: [
        {
          value: 'cwaf',
          label: 'Cwaf',
          type: ['apache2', 'nginx']
        },
        {
          value: 'coreruleset-3.3.0',
          label: 'Coreruleset-3.3.0',
          type: ['apache2', 'nginx']
        },
        {
          value: 'owasp-modsecurity-crs-2.2',
          label: 'Owasp-modsecurity-crs-2.2',
          type: ['apache2', 'nginx']
        }
      ]
    }
  },
  async mounted() {
    await this.loadEngineTypes();
    await this.loadRulePackages();
    await this.getList();
  },
  methods: {
    loadRulePackages() {
      return rf.getRequest('RulePackageRequest').getList(this.params).then(async response => {
        this.rulePackages = response.map((item) => ({
          value: item.application,
          version: item.version,
          label: `${item.application}-${item.version}`,
          type: [item.application]
        }));
      }).catch(error => {
        this.errors.add({field: 'error', msg: error.response.data.message});
        Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
      });
    },
    engineTypeLabel : engineTypeLabel,
    getList() {
      return rf.getRequest('EngineRequest').getList(this.params).then(response => {
        this.list = map(response, res => {
          return {
            idEngine: res.idEngine,
            idEnginetype: res.idEnginetype,
            name: res.name,
            idObject: res.idObject,
            specs: JSON.parse(res.specs)
          }
        });
        this.total = response.length
      }).catch(error => {
        console.log(error)
        this.errors.add({field: 'error', msg: error.response.data.message});
        Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
      }).finally( () => {
        this.listLoading = false;
      });
    },
    loadEngineTypes() {
      let params = {}
      return rf.getRequest('EngineTypeRequest').getList(params).then(response => {
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
      await this.$validator.validate('hostname');
      await this.$validator.validate('port');
      if (this.errors.any()) {
        return;
      }
      let params = cloneDeep(this.temp)
      params = {
        ...params,
        specs: JSON.stringify(params.specs)
      }

      rf.getRequest('EngineRequest').create(params)
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
      let params = cloneDeep(this.temp)
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
    handleViewRuleManagement(row) {
      this.selectedRow = row
      this.queryHost(row.idObject).then(() => {
        this.ruleManagementVisible = true
      })
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

    queryHost (objectId, idEnginetype) {
      return rf.getRequest('ContainmentRelRequest').queryHost(objectId, idEnginetype)
      .then((res) => {
        this.hostCanView = res.data || {}
      })
    },

    handleClose(key, server) {
      this.submitRulesetLoading = true
      return rf.getRequest('ContainmentRelRequest').deleteRuleset(this.selectedRow.idObject, {
        webserver: key,
        ruleset: server
      })
        .then(() => {
          this.hostCanView[key].splice(this.hostCanView[key].indexOf(server), 1);
          this.$notify({
            title: this.$t('notify.success.label'),
            message: this.$t('notify.success.deleteSuccess'),
            type: 'success',
            duration: 1000,
            showClose: false
          })
        })
        .catch((error) => {
          this.$notify({
            title: this.$t('notify.errors.label'),
            message: error,
            type: 'error',
            duration: 1000,
            showClose: false
          })
          this.inputValue = '';
        })
        .finally(() => {
          this.submitRulesetLoading = false
        })
    },

    showInput(value) {
      value.inputVisible = true;
      /*this.$nextTick(() => {
        this.$refs.rulesetInput[0].focus();
      });*/
    },


    handleInputConfirm(key) {
      let inputValue = this.inputValue;
      if (inputValue) {
        this.submitRulesetLoading = true
        return rf.getRequest('ContainmentRelRequest').addRuleset(this.selectedRow.idObject, {
          webserver: key,
          ruleset: inputValue
        })
          .then(() => {
            this.hostCanView[key].push(inputValue);
            this.$notify({
              title: this.$t('notify.success.label'),
              message: this.$t('notify.success.createSuccess'),
              type: 'success',
              duration: 1000,
              showClose: false
            })
            this.inputVisible = false;
            this.inputValue = '';
          })
          .catch((error) => {
            this.$notify({
              title: this.$t('notify.errors.label'),
              message: error,
              type: 'error',
              duration: 1000,
              showClose: false
            })
            this.inputValue = '';
          })
          .finally(() => {
            this.submitRulesetLoading = false
          })
      }
      this.inputVisible = false;
      this.inputValue = '';
    },
    getRulesetOptions(node) {
      console.log(node);
      switch(node.idEnginetype) {
        case 1: return this.rulePackages;
        default: return this.rulesetOptions;
      }
    }
  },
}
</script>

<style lang="scss" scoped>
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
  }
</style>
