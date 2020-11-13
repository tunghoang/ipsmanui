<template>
  <div class="app-container node-managerment">
    <el-row :gutter="10">
      <el-col :sm="24" :md="6">
        <el-card shadow="always">
          <el-form ref="form" :model="treeConfig" label-width="100px">
            <el-form-item label="Tree type">
              <el-select v-model="treeConfig.type" placeholder="Select Tree type">
                <el-option
                  label="tree"
                  value="tree">
                </el-option>
                <el-option
                  label="cluster"
                  value="cluster">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Layout type">
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
            <el-form-item label="Node text display">
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
            <el-form-item label="Link layout">
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
              <el-button type="primary" size="small" plain @click.native="resetZoom">Reset Zoom</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :sm="24" :md="18">
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
                <el-popover
                  placement="right"
                  width="300"
                  trigger="click">
                  <p>Node: <el-link type="primary">{{ data.name }}</el-link></p>
                  <p>Status: {{ data.status }}</p>
                  <el-switch
                    v-model="data.status"
                    active-value="active"
                    inactive-value="inactive"
                    />
                  <p>Endpoint: {{ data.specs.endpoint || null }}</p>
                  <p>Username: {{ data.specs.username || null }}</p>
                  <el-table :data="data.children" v-if="data.children.length > 0">
                    <el-table-column width="60" property="idContainer" label="idContainer"></el-table-column>
                    <el-table-column align="center" width="210" property="name" label="name"></el-table-column>
                    <template slot="empty">{{ $t('node.empty_child_node') }}</template>
                  </el-table>
                  <el-button slot="reference" size="mini" type="info" plain data-toggle="tooltip" :title="$t('node.detail')">
                    <svg-icon icon-class="eye-open" />
                  </el-button>
                </el-popover>
                <el-button @click.native="addFor(data)" size="mini" type="success" plain data-toggle="tooltip" :title="$t('node.add_child_node')" style="margin-left: 10px;">
                  <svg-icon icon-class="plus" />
                </el-button>
                <el-button @click.native="remove(data, node)" size="mini" type="danger" plain data-toggle="tooltip" :title="$t('node.remove_child_node')">
                  <svg-icon icon-class="delete" />
                </el-button>
              </div>
            </template>
          </tree>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
const removeElement = (arr, element) => {
  const index = arr.indexOf(element)
  if (index === -1) {
    return
  }
  arr.splice(index, 1)
}
import { tree } from 'vued3tree'
import rf from 'requestfactory'
import { Message } from 'element-ui'
import { forEach } from 'lodash'
import GroupIcon from './GroupIcon'
import NodeIcon from './NodeIcon'
export default {
  name: 'DetailNode',
  components: {
    tree,
    GroupIcon,
    NodeIcon
  },
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
      currentId: 500,
      isLoading: false,
      tree: {
        children: [],
        idContainer: 0,
        name: 'IPS Manager',
        status: 'active',
        idEngine: null,
        load: true
      }
    }
  },
  created () {
    this.getList()
  },
  methods: {
    getList() {
      rf.getRequest('ContainmentRelRequest').getList(this.params)
      .then(res => {
        forEach(res, async (object) => {
          const newData = {
            idContainer: object.idObject,
            children: [],
            name: object.name || object.idContainee,
            status: await this.fakeStatus(),
            idEngine: object.idEngine,
            specs: await this.getDetailEngine(object.idEngine),
            load: false
          }
          this.tree.children.push(newData)
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
      // console.log(evt)
      // return
      if (evt.data.load) return
      const params = {
        idContainer: evt.data.idContainer
      }
      evt.data.load = true
      rf.getRequest('ContainmentRelRequest').getChildNode(params)
        .then((res) => {
          forEach(res, async (object) => {
            const newData = {
              idContainer: object.idObject,
              children: [],
              name: object.name || object.idContainee,
              status: await this.fakeStatus(),
              specs: await this.getDetailEngine(object.idEngine),
              load: false
            }
            evt.data.children.push(newData)
          })
        })
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
      const newData = {
        id: this.currentId++,
        children: [],
        name: Math.random().toString(36).substring(7),
        status: await this.fakeStatus()
      }
      data.children.push(newData)
    },
    remove (data, node) {
      const parent = node.parent.data
      removeElement(parent.children, data)
    },
    resetZoom () {
      if (!this.$refs['tree']) {
        return
      }
      this.$refs['tree'].resetZoom()
    },
    fakeStatus () {
      return new Promise((resolver) => {
        const statusList = ['active', 'inactive', 'unknow']
        setTimeout(() => {
          resolver(statusList[Math.floor((Math.random() * 3))])
        }, 500)
      })
    },
    fakeSpecs () {
      return new Promise((resolver) => {
        setTimeout(() => {
          resolver({
            endpoint: 'google.com',
            username: Math.random().toString(36).substring(8),
            password: Math.random().toString(36).substring(8)
          })
        }, 500)
      })
    },
    async getDetailEngine (id) {
      if(id === null) return {}
      let { specs } = await rf.getRequest('EngineRequest').detail(id)
      specs = JSON.parse(specs.replaceAll('\'', '\"'))
      const specsFake = await this.fakeSpecs()
      specs = {
        ...specs,
        ...specsFake
      }
      return specs
    }
  },
}
</script>

<style lang="scss" scoped>
  .tree {
    height: 800px;
    ::v-deep.nodetree {
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
          fill: #f56c6c;
          path {
            fill: #f56c6c;
          }
        }
        &.unknow {
          fill: #8d8d8d;
          path {
            fill: #8d8d8d;
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
</style>
