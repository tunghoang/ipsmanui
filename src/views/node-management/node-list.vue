<template>
  <div class="app-container node-management">
    <el-row :gutter="10">
<!--       <el-col :sm="24" :md="6">
        <el-card shadow="always">
          <el-form ref="form" :model="treeConfig" label-width="100px">            
            <el-form-item :label="$t('node.layout_type')" prop="layoutType">
              <el-select v-model="treeConfig.layoutType" placeholder="Select Layout type">
                <el-option
                  label="circular"
                  value="circular">
                </el-option>
                <el-option
                  label="vertical"
                  value="vertical">
                </el-option>
                <el-option
                  label="horizontal"
                  value="horizontal">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('node.node_text_display')" prop="nodeTextDisplay">
              <el-select v-model="treeConfig.nodeTextDisplay" placeholder="Select Node text display">
                <el-option
                  label="all"
                  value="all">
                </el-option>
                <el-option
                  label="leaves"
                  value="leaves">
                </el-option>
                <el-option
                  label="extremities"
                  value="extremities">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('node.link_layout')" prop="linkLayout">
              <el-select v-model="treeConfig.linkLayout" placeholder="Select Node link layout">
                <el-option
                  label="bezier"
                  value="bezier">
                </el-option>
                <el-option
                  label="orthogonal"
                  value="orthogonal">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label-width="0">
              <el-button type="primary" size="small" plain @click.native="resetNode">{{ $t('node.reset') }}</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col> -->
      <el-col :sm="24" :md="24">
        <el-card shadow="always" v-loading="isLoading">
          <tree ref="tree"
            v-model="treeConfig.currentData"
            :nodeTextDisplay="treeConfig.nodeTextDisplay"
            :identifier="getId"
            :nodeTextMargin="10"
            :zoomable="treeConfig.zoomable"
            :data="tree"
            :leafTextMargin="30"
            :node-text="treeConfig.nodeText"
            :margin-x="150"
            :margin-y="30"
            :type="treeConfig.type"
            :layout-type="treeConfig.layoutType"
            :linkLayout="treeConfig.linkLayout"
            popUpPlacement="bottom-end"
            :minZoom="0.6"
            :maxZoom="3.6"
            class="tree"
            @clickedText="onClick"
            @expand="onExpand"
            @retract="onRetract"
            @clickedNode="onClickNode">
            <template #node="{ data }">
                <GroupIcon class="node-icon" :class="data.status" v-if="data.idEngine === null"></GroupIcon>
                <NodeIcon class="node-icon" :class="data.status" v-else :idEnginetype="data.idEnginetype"></NodeIcon>
              <circle r="6" :class="data.status">
                <title>{{data.name}}</title>
              </circle>
            </template>
            <template #popUp="{ data, node }">
              <div class="btn-group-vertical mt-1">
                  <el-button slot="reference" size="mini" type="info" plain data-toggle="tooltip" :title="$t('node.detail')" @click="viewDetailNode(data)" v-if="!data.root">
                    <svg-icon icon-class="eye-open" />
                  </el-button>
                <el-button @click.native="addFor(data)" v-if="!data.idEngine" size="mini" type="success" plain data-toggle="tooltip" :title="$t('node.add_child_node')" style="margin-left: 10px;">
                  <svg-icon icon-class="plus" />
                </el-button>
                <el-button @click.native="remove(data, node)" v-if="!data.root" size="mini" type="danger" plain data-toggle="tooltip" :title="$t('node.remove_child_node')" style="margin-left: 10px;">
                  <svg-icon icon-class="delete" />
                </el-button>
              </div>
            </template>
          </tree>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" @close="resetTemp()">
      <el-form ref="dataFormSingle" :model="temp" label-position="left" label-width="100px" style="width: 100%">
        <el-form-item :label="$t('table.engine')" prop="idEngine" v-if="this.dialogStatus === 'create'">
          <el-select
                v-model="temp.idEngine"
                class="filter-item"
                placeholder="Please select"
                name="engine"
                clearable
                @clear="temp.idEngine = undefined"
                @focus="resetError"
                :class="{ error: errors.has('engine') }"
                data-vv-validate-on="none"
                v-validate="'required'">
            <el-option v-for="item in engines" :key="item.idEngine" :label="JSON.parse(item.specs).hostname" :value="item.idEngine" @click.native="onClickAutoFillNodeName(JSON.parse(item.specs).hostname)" />
          </el-select>
          <div class="el-form-item__error" v-if="errors.has('engine')">
            {{ errors.first('engine') }}
          </div>
        </el-form-item>
        <el-form-item :label="$t('table.name')" props="name">
          <el-input v-model="temp.name"
                    tabindex="1"
                    @focus="resetError"
                    name="name"
                    :placeholder="$t('table.name')"
                    :class="{ error: errors.has('name') }"
                    data-vv-validate-on="none"
                    v-validate="'required|min:4|max:255'" />
          <div class="el-form-item__error" v-if="errors.has('name')">
            {{ errors.first('name') }}
          </div>
        </el-form-item>
        <el-form-item :label="$t('table.description')" props="description" v-if="this.dialogStatus === 'create'">
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
    <DialogIps :objectCanView="objectCanView" v-if="!isEmpty(objectCanView)" :dialogVisible="dialogVisible" @updateNode="updateNode" @close="handleClose" :refer="'node'" @detail="detailIps"></DialogIps>
  </div>
</template>

<script>
const removeChild = (arr, element) => {
  const index = arr.indexOf(element)
  if (index === -1) {
    return
  }
  arr.splice(index, 1)
}
const removeAllChild = (arr) => {
  arr.splice(0, arr.length)
}
import { tree } from 'vued3tree'
import rf from 'requestfactory'
import { Message } from 'element-ui'
import { forEach, isEmpty } from 'lodash'
import GroupIcon from './GroupIcon'
import NodeIcon from './NodeIcon'
import { statusDeduce } from '../../utils'
import RemoveErrorsMixin from 'common/RemoveErrorsMixin'
import DialogIps from './DialogIps'
import { cloneDeep } from 'lodash'

export default {
  name: 'NodeManagement',

  components: {
    tree,
    GroupIcon,
    NodeIcon,
    DialogIps
  },

  mixins: [RemoveErrorsMixin],

  data() {
    return {
      treeConfig: {
        type: 'tree',
        layoutType: 'horizontal',
        nodeText: 'name',
        currentData: null,
        zoomable: true,
        nodeTextDisplay: 'all',
        linkLayout: 'bezier',
        events: []
      },
      isLoading: false,
      tree: {
        root: true,
        children: [],
        idContainer: 0,
        name: 'IPS Manager',
        status: 'active',
        idEngine: null,
        load: true
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: this.$t('table.edit'),
        create: this.$t('table.create')
      },
      engines: [],
      temp: {
        idObject: undefined,
        idEngine: undefined,
        name: '',
        description: ''
      },
      objectCanAdd: {},
      objectCanView: {},
      dialogVisible: false,
      onlineLoading: false,
      nodeFormVisible: false,
      collapsed: true,
      monitorDirectoriesVisible: false,
      monitorDirectoriesCanView: [],
      newDir: null
    }
  },

  created () {
  rf.getRequest('EngineRequest').getList(this.params)
    .then(async response => {
      this.engines = response
      this.getList()
    })
  },

  methods: {
    isEmpty(value) {
      return !!isEmpty(value)
    },
    getList () {
      rf.getRequest('ContainmentRelRequest').getList(this.params)
      .then(res => {
        forEach(res, async (object) => {
          let status = 'unknown';
          let statusResponse = {}
          if (object.idEngine) {
            statusResponse = await rf.getRequest('ContainmentRelRequest').checkHostStatus(object.idObject) || {};
            status = statusDeduce(statusResponse) || status;
          }
          const newData = {
            idContainer: object.idObject,
            children: [],
            name: object.name || object.idContainee,
            description: object.description,
            status,
            online: statusResponse.online || false,
            enabled: statusResponse.enabled || false,
            idEngine: object.idEngine,
            specs: this.hasEngine(object) && await this.getDetailEngine(object.idEngine),
            load: this.hasEngine(object)
          }
          await this.tree.children.push(newData)
        })
      })
      .catch(error => {
        this.errors.add({field: 'error', msg: error.response.data.message});
        Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknownError'))
      })
      .finally(() => this.listLoading = false)
    },
    async do (action) {
      if (this.treeConfig.currentData) {
        this.isLoading = true
        await this.$refs['tree'][action](this.treeConfig.currentData)
        this.isLoading = false
      }
    },
    getId (node) {
      return node.idContainer
    },
    expandAll () {
      this.do('expandAll')
    },
    collapseAll () {
      this.do('collapseAll')
    },
    showOnly () {
      this.do('showOnly')
    },
    show () {
      this.do('show')
    },
    onClick (evt) {
      this.onEvent('clickedText', evt)
    },
    onClickNode (evt) {
      if (evt.data.idEngine) {
        console.log(evt.data);
        this.viewDetailNode(evt.data)
        return
      }
      if (evt.data.load) return
      const params = {
        idContainer: evt.data.idContainer
      }
      evt.data.load = true;

      let appendNode = async (object) => {
        let status = 'unknown';
        let statusResponse = {}
        let serviceStates;
        if (object.idEngine) {
          try {
            statusResponse = await rf.getRequest('ContainmentRelRequest').checkHostStatus(object.idObject);
            status = statusDeduce(statusResponse);
            serviceStates = JSON.parse(statusResponse.data);
            console.log(serviceStates);
          } catch (e) {
            statusResponse = {}
            status = 'unknown';
          }
        }
        const newData = {
          idContainer: object.idObject,
          children: [],
          name: object.name || object.idContainee,
          description: object.description,
          status,
          serviceStates,
          online: statusResponse.online || false,
          enabled: statusResponse.enabled || false,
          idEngine: object.idEngine,
          specs: this.hasEngine(object) && await this.getDetailEngine(object.idEngine),
          load: this.hasEngine(object),
          idEnginetype: object.idEnginetype
        }

        evt.data.children.push(newData);
      }
      rf.getRequest('ContainmentRelRequest').getChildNode(params).then(async (res) => {
        if (res.length === 0) {
          evt.data.status = 'inactive';
          return;
        }
        evt.data.status = 'active';
        removeAllChild(evt.data.children);
        for (let object of res) {
          await appendNode(object);
        }
      }).catch(e => console.error(e));
      

      this.onEvent('clickedNode', evt)
    },
    onExpand (evt) {
      this.onEvent('onExpand', evt)
    },
    onRetract (evt) {
      this.onEvent('onRetract', evt)
    },
    onEvent (eventName, data) {
      this.treeConfig.events.push({eventName, data: data.data})
    },
    async addFor (data) {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.objectCanAdd = data
    },
    updateNode () {
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.temp = {
        name: this.objectCanView.name
      }
    },
    resetTemp () {
      return this.temp = {
        idObject: undefined,
        idEngine: undefined,
        name: '',
        description: ''
      }
    },
    async viewDetailNode(data) {
      this.objectCanView = await data
      this.dialogVisible = true
    },
    handleClose() {
      this.objectCanView = {}
      this.dialogVisible = false
      this.resetTemp()
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
      this.startSubmit()
      rf.getRequest('ContainmentRelRequest').create(this.temp)
      .then(async (object) => {
        this.dialogFormVisible = false
        const newData = {
          idContainer: object.idObject,
          children: [],
          name: object.name || object.idContainee,
          description: object.description,
          status: 'unknown',
          idEngine: object.idEngine,
          specs: this.hasEngine(object) && await this.getDetailEngine(object.idEngine),
          load: this.hasEngine(object),
        }
        await this.objectCanAdd.children.push(newData)
        if (this.objectCanAdd.root) return
        rf.getRequest('ContainmentRelRequest').addToGroup({
          idContainer: this.objectCanAdd.idContainer,
          idContainee: object.idObject
        })
          .then(() => {
            this.$notify({
              title: this.$t('notify.success.label'),
              message: this.$t('notify.success.createSuccess'),
              type: 'success',
              duration: 1000,
              showClose: false
            })
            this.resetTemp()
            this.objectCanAdd = {}
          })
      })
      .catch(error => {
        this.handleError(error)
      })
      .finally(() => {
        this.endSubmit()
      })
    },
    async updateData () {
      this.resetError();
      if (this.isSubmitting) {
        return;
      }
      await this.$validator.validate('name');
      if (this.errors.any()) {
        return;
      }
      this.startSubmit()
      rf.getRequest('ContainmentRelRequest').update(this.objectCanView.idContainer , this.temp)
      .then(() => {
        this.dialogFormVisible = false
        this.$notify({
          title: this.$t('notify.success.label'),
          message: this.$t('notify.success.updateSuccess'),
          type: 'success',
          duration: 1000,
          showClose: false
        })
        this.objectCanView.name = this.temp.name
      })
      .catch(error => {
        this.handleError(error)
      })
      .finally(() => {
        this.endSubmit()
      })
    },
    remove (data, node) {
       this.$confirm(this.$t('notify.text.delete'), 'Warning', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          rf.getRequest('ContainmentRelRequest').delete(data.idContainer)
            .then(() => {
              const parent = node.parent.data
              removeChild(parent.children, data)
            })
          this.$message({
            type: 'success',
            message: 'Delete completed'
          });
        }).catch(() => {       
        })
    },
    hasEngine (object) {
      return !!object.idEngine;
    },
    resetNode () {
      if (!this.$refs['tree']) {
        return
      }
      this.$refs['form'].resetFields()
      this.$refs['tree'].resetZoom()
    },
    changeLock() {
      this.objectCanView.enabled = !this.objectCanView.enabled
    },
    getNodeStatus (object) {
      if (!object.idEngine) return 'unknown';
      return new Promise((resolver) => {
        const statusList = ['active', 'inactive', 'unknown']
        setTimeout(() => {
          resolver(statusList[Math.floor((Math.random() * 3))])
        }, 500)
      })
    },
    async getDetailEngine (id) {
      if(id === null) return {}
      let { idEnginetype, specs } = await rf.getRequest('EngineRequest').detail(id)
      specs = JSON.parse(specs);
      console.log(idEnginetype, specs);
      specs.idEnginetype = idEnginetype;
      console.log(specs);
      return specs
    },
    async updateObject () {
      this.resetError();
      if (this.isSubmitting) {
        return;
      }
      await this.$validator.validate('object_name');
      await this.$validator.validate('object_description');
      if (this.errors.any()) {
        return;
      }
      let params = cloneDeep(this.objectCanView)
      rf.getRequest('ContainmentRelRequest').update(params.idContainer, { name: params.name, description: params.description })
      .then(() => {
        this.dialogFormVisible = false
        this.$notify({
          title: this.$t('notify.success.label'),
          message: this.$t('notify.success.updateSuccess'),
          type: 'success',
          duration: 1000,
          showClose: false
        })
      })
    },
    detailIps () {
      this.dialogVisible = false
      this.$router.push({ name: 'HostOverviewECS', params: { hostname: this.objectCanView.specs.hostname } })
    },
    onClickAutoFillNodeName (hostname) {
      this.temp.name = hostname
    }
  }
}
</script>

<style lang="scss" scoped>
  ::v-deep.node-management {
    .tree {
      height: 800px;
      .nodetree {
        g.node {
          cursor: pointer;
        }
        circle, svg {
          &.active {
            fill: #67c23a;
            path {
              fill: #67c23a;
            }
          }
          &.inactive {
            fill: #8d8d8d;
            path {
              fill: #8d8d8d;
            }
          }
          &.unknown {
            fill: rgb(24, 144, 255);
            path {
              fill: rgb(24, 144, 255);
            }
          }
        }
        svg.node-icon {
          overflow: inherit;
          >g {
            transform: translate(-24px, -24px);
          }
        }
        circle {
          visibility: hidden;
        }
        &.node--internal {
          >text {
            font-weight: bold;
            transform: rotateZ( -20deg);
          }
        }
        &.selected {
          >text {
            fill: #409eff;
          }
        }
      }
    }
  }
</style>  
