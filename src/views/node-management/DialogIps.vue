<template>
  <div>
    <el-dialog
      :visible.sync="dialogVisible"
      @close="$emit('close')"
      width="600px"
      :before-close="beforeClose()"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      :show-close="false">
      <template #title>
        <div>
          <h2>
            <svg-icon :icon-class="objectCanView.idEnginetype === 2 ? 'host':'netIPS'" />
            {{objectCanView.description}} ({{ objectCanView.name }})
            <a class="r" style="color:navy;" @click="onClickSetupNode()">
              <i class="el-icon-s-tools"></i>
            </a>
          </h2>
        </div>
      </template>
      <div class="clearfix"></div>
      <template>
        <!--
        <div class="my-row">
          <div class='row-text'>
            <strong>Status:</strong>{{ objectCanView.enabled ? (objectCanView.online ? 'online' : 'offline') : 'disabled' }}
          </div>
        </div>
        -->
        <div class="my-row" style="cursor: pointer;">
          <div class='row-text' @click="collapsed=!collapsed">
            <strong>Online</strong>
            {{ objectCanView.online ? 'online' : 'offline' }}
            <a class="pl-10" style="color: blue;"><i :class="{'el-icon-arrow-right': collapsed, 'el-icon-arrow-down': !collapsed}"></i></a>
          </div>
          <el-switch class="r" v-model="objectCanView.online"></el-switch>
          <div v-show="!collapsed" class="my-row-child">
            <div v-for="(srv, idx) in objectCanView.serviceStates" :key="idx" class='pt-1'>
              <i :class="{'el-icon-success color-success mr-1':srv.running, 'el-icon-remove color-danger mr-1': !srv.running}">
              </i>
              <span class="service-name">{{srv.service}}</span> : <span class="service-status">{{srv.running?'running':'stopped'}}</span>
            </div>
          </div>
        </div>
        <div class="my-row">
          <div class="row-text">
            <strong>Enabled:</strong>
            {{ objectCanView.enabled ? 'enabled' : 'disabled' }}
          </div>
          <el-switch class="r" v-model="objectCanView.enabled"></el-switch>
        </div>
        <div class="my-row">
          <div class="row-text">
            <strong>Endpoint:</strong>{{ objectCanView.specs.hostname || null }}
          </div>
        </div>
        <div class="my-row">
          <div class="row-text">
            <strong>Port:</strong> {{ objectCanView.specs.port || null }}
          </div>
        </div>
      </template>
      <div v-if="!objectCanView.idEngine" class="my-row">
        <div class="row-text">
          <strong>Status:</strong>{{ objectCanView.status }}
        </div>
      </div>
      <div class="clearfix"></div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="onclickOpenManagerMonitorDirectories">Manage Monitor Directories</el-button>
          <template v-if="refer === 'node' && objectCanView.idEngine">
            <el-button @click="$emit('updateNode')">Edit</el-button>
          </template>
          <el-button @click="$emit('detail')"
            >Detail</el-button>
          <el-button @click="$emit('close')">Close</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog
      :visible.sync="monitorDirectoriesVisible"
      width="500px">
      <template #title>
        <div>
          <h2>
            Monitored directories on {{objectCanView.name}}
          </h2>
        </div>
      </template>
      <el-form :inline="true" class='tc'>
        <el-form-item>
          <el-button :disabled="!newDir || !newDir.length" @click.prevent.stop="addNewDir">Add</el-button>
        </el-form-item>
        <el-form-item>
          <el-input v-model="newDir" placeholder="New directory"></el-input>
        </el-form-item>
      </el-form>
      <ul class="list-style-none">
        <li style="margin: 5px 0 0 0" :key="index" v-for="(i, index) in monitorDirectoriesCanView">
          <div class="directory-entry">
            <a style="margin: 0 7px 0 0;" @click="doRemoveDirectory(i, index)"><i class="el-icon-error"></i></a>
            {{ i }}
          </div>
        </li>
      </ul>
      <div slot="footer" class="dialog-footer">
        <el-button @click="monitorDirectoriesVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="updateMonitorDirectories">
          {{ $t('table.update') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import rf from 'requestfactory'

export default {
  name: 'DialogDetailIPS',

  props: {
    objectCanView: {
      type: Object,
      required: true
    },
    dialogVisible: {
      type: Boolean,
      default: false
    },
    refer: {
      type: String,
      required: false
    }
  },

  data () {
    return {
      dialogStatus: '',
      dialogFormVisible: false,
      collapsed: true,
      monitorDirectoriesVisible: false,
      monitorDirectoriesCanView: [],
      newDir: null
    }
  },

  methods: {
    updateNode () {
      this.$emit('updateNode')
    },

    beforeClose () {
      this.$emit('handleClose')
    },
    async onClickSetupNode () {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      await new Promise(resolve => setTimeout(resolve, 3000));
      loading.close()
    },

    onclickOpenManagerMonitorDirectories () {
    rf.getRequest('ContainmentRelRequest').monitorDirectories(this.objectCanView.idContainer)
    .then(async (res) => {
      this.monitorDirectoriesCanView = res.data
      this.monitorDirectoriesVisible = true
    })
  },

  updateMonitorDirectories () {
    rf.getRequest('ContainmentRelRequest').updateMonitorDirectories(this.objectCanView.idContainer, this.monitorDirectoriesCanView)
      .then(async () => {
        this.$notify({
          title: this.$t('notify.success.label'),
          message: this.$t('notify.success.updateSuccess'),
          type: 'success',
          duration: 1000,
          showClose: false
        });
        this.monitorDirectoriesVisible = false;
      })
    },
    doRemoveDirectory (i, index) { 
      this.monitorDirectoriesCanView.splice(index, 1)
    },
    addNewDir() {
      if (!this.newDir || !this.newDir.length) return;
      this.monitorDirectoriesCanView.push((" " + this.newDir).slice(1));
      this.newDir = null;
    }
  }
}
</script>

<style lang="scss" scoped>
.el-dialog__body {
  padding-top: 0;
  padding-bottom: 0;
}
.width-100 {
  width: 75px;
}
.my-row {
  border-bottom: 1px solid #ccc;
  padding: 1em 0;
}
.row-text {
  display: inline-block;
  vertical-align: middle;
  user-select: none;
}
.my-row-child {
  padding: 0.3em 0 0.3em 2em;
}
ul.list-style-none {
  list-style: none;
}
div.directory-entry {
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1.2em;
  padding: 7px;
}
.service-name {
  font-weight: 500;
}
.service-status {
  font-weight: 300;
  font-style: italic;
}
</style>
