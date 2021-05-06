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
                <NodeIcon class="node-icon" :class="data.status" v-else></NodeIcon>
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
        <el-form-item :label="$t('table.engine')" prop="idEngine">
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
            <el-option v-for="item in engines" :key="item.idEngine" :label="item.specs" :value="item.idEngine" />
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
        <el-form-item :label="$t('table.description')" props="description">
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
    <el-dialog
      :visible.sync="dialogVisible"
      @close="resetTemp()"
      :before-close="handleClose">
      <template #title>
        <div class="tc">
          <h2>{{ objectCanView.name }}</h2>
        </div>
      </template>
      <div>
        <el-button class="r" @click.native="onClickSetupNode" :loading="setupLoading" icon="el-icon-s-tools" size="default">Setup</el-button>
      </div>
      <div class="clearfix"></div>
      <template v-if="objectCanView.idEngine">
        <p>
          <strong>Status:</strong>
          {{ objectCanView.enabled ? (objectCanView.online ? 'online' : 'offline') : 'disabled' }}
        </p>
        <p class="pt-1">
          <span>
            <strong>Online:</strong>
            {{ objectCanView.online ? 'online' : 'offline' }}
          </span>
          <el-button :loading="onlineLoading" size="mini" class="r" :type="objectCanView.online ? 'primary' : 'info'" @click="changeOnline">{{ objectCanView.online ? 'offline' : 'online' }}</el-button>
        </p>
        <p class="pt-1">
          <span>
            <strong>Enabled:</strong>
            {{ objectCanView.enabled ? 'enabled' : 'disabled' }}
          </span>
          <el-button size="mini" class="r" :type="objectCanView.enabled ? 'primary' : 'info'" @click="changeLock">{{ objectCanView.enabled ? 'disabled' : 'enabled'  }}</el-button>
        </p>
        <p>
          <strong>Endpoint:</strong>
          {{ objectCanView.specs.endpoint || null }}
        </p>
        <p>
          <strong>Type:</strong>
          {{ objectCanView.specs.type || null }}
        </p>
      </template>
      <p v-else>
        <strong>Status:</strong>
        {{ objectCanView.status }}
      </p>
<!--  <div>
        <el-button class="r" size="medium">Monitor</el-button>
      </div>
      <div class="clearfix"></div>
 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
        </span>
      </template>
    </el-dialog>
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
import { forEach } from 'lodash'
import GroupIcon from './GroupIcon'
import NodeIcon from './NodeIcon'
import { statusDeduce } from '../../utils'
import RemoveErrorsMixin from 'common/RemoveErrorsMixin'

export default {
  name: 'NodeManagement',

  components: {
    tree,
    GroupIcon,
    NodeIcon
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
      setupLoading: false
    }
  },

  created () {
  rf.getRequest('EngineRequest').getList(this.params)
    .then(async response => {
      this.engines = response
      this.getList()
    })
  },

  // watch: {
  //   'temp.idEngine' (val) {
  //     this.idEngine = val === null || val === '' ? undefined : val
  //   }
  // },

  methods: {
    getList () {
      rf.getRequest('ContainmentRelRequest').getList(this.params)
      .then(res => {
        forEach(res, async (object) => {
          let status = 'unknow';
          let statusResponse = {}
          if (object.idEngine) {
            statusResponse = await rf.getRequest('ContainmentRelRequest').checkHostStatus(object.idObject);
            status = statusDeduce(statusResponse);
          }
          const newData = {
            idContainer: object.idObject,
            children: [],
            name: object.name || object.idContainee,
            description: object.description,
            status,
            online: statusResponse.online,
            enabled: statusResponse.enabled,
            idEngine: object.idEngine,
            specs: this.hasEngine(object) && await this.getDetailEngine(object.idEngine),
            load: this.hasEngine(object)
            }
          await this.tree.children.push(newData)
        })
      })
      .catch(error => {
        this.errors.add({field: 'error', msg: error.response.data.message});
        Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
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
        this.viewDetailNode(evt.data)
        return
      }
      if (evt.data.load) return
      const params = {
        idContainer: evt.data.idContainer
      }
      evt.data.load = true;

      let appendNode = async (object) => {
        let status = 'unknow';
        let statusResponse = {}
        if (object.idEngine) {
          statusResponse = await rf.getRequest('ContainmentRelRequest').checkHostStatus(object.idObject);
          status = statusDeduce(statusResponse);
        }
        const newData = {
          idContainer: object.idObject,
          children: [],
          name: object.name || object.idContainee,
          description: object.description,
          status,
          online: statusResponse.online,
          enabled: statusResponse.enabled,
          idEngine: object.idEngine,
          specs: this.hasEngine(object) && await this.getDetailEngine(object.idEngine),
          load: this.hasEngine(object)
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
        console.log(res);
        for (let object of res) {
          try {
            await appendNode(object);
          }
          catch(e) {
            console.error(e);
          }
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
    resetTemp () {
      return this.temp = {
        idObject: undefined,
        idEngine: undefined,
        name: '',
        description: ''
      }
    },
    viewDetailNode(data) {
      this.objectCanView = data
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
          status: 'unknow',
          idEngine: object.idEngine,
          specs: this.hasEngine(object) && await this.getDetailEngine(object.idEngine),
          load: this.hasEngine(object)
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
    changeOnline() {
      if (this.isSubmitting) return
      const instence = rf.getRequest('ContainmentRelRequest')
      this.startSubmit()
      this.onlineLoading = true
      if (this.objectCanView.online) {
        instence.stopHost(this.objectCanView.idContainer)
          .then((res) => {
            this.objectCanView.online = res.online
            this.objectCanView.status = statusDeduce(res)
            this.objectCanView.enabled = res.enabled
          })
          .catch(e => console.log(e))
          .finally(() => {
            this.endSubmit()
            this.onlineLoading = false
          })
        return
      }
      instence.startHost(this.objectCanView.idContainer)
        .then((res) => {
          this.objectCanView.online = res.online
          this.objectCanView.status = statusDeduce(res)
          this.objectCanView.enabled = res.enabled
        })
        .catch(e => console.log(e))
        .finally(() => {
          this.endSubmit()
          this.onlineLoading = false
        })
    },
    changeLock() {
      this.objectCanView.enabled = !this.objectCanView.enabled
    },
    getNodeStatus (object) {
      if (!object.idEngine) return 'unknow';
      return new Promise((resolver) => {
        const statusList = ['active', 'inactive', 'unknow']
        setTimeout(() => {
          resolver(statusList[Math.floor((Math.random() * 3))])
        }, 500)
      })
    },
    async getDetailEngine (id) {
      if(id === null) return {}
      let { specs } = await rf.getRequest('EngineRequest').detail(id)
      specs = JSON.parse(specs)
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
      let params = window._.cloneDeep(this.objectCanView)
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
    async onClickSetupNode () {
      this.setupLoading = true
      await new Promise(resolve => setTimeout(resolve, 3000));
      this.setupLoading = false
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
          &.unknow {
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
    .el-dialog__body {
      padding-top: 0;
      padding-bottom: 0;
    }
  }
</style>
