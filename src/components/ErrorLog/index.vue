<template>
  <div v-if="errorLogs.length>0">
    <el-badge :value="errorLogs.length" style="line-height: 25px;margin-top: -5px;" @click.native="dialogTableVisible=true">
      <el-button style="padding: 8px 10px;" size="small" type="danger">
        <svg-icon icon-class="bug" />
      </el-button>
    </el-badge>

    <el-dialog :visible.sync="dialogTableVisible" width="80%" append-to-body>
      <div slot="title">
        <span style="padding-right: 10px;vertical-align: middle;">{{ $t('error_log.title') }}</span>
        <el-button size="mini" type="primary" icon="el-icon-delete" @click="clearAll">{{ $t('error_log.clear_all') }}</el-button>
      </div>
      <el-table :data="errorLogs" border>
        <el-table-column label="Message">
          <template slot-scope="{row}">
            <div>
              <span class="message-title">{{ $t('error_log.message') }}:</span>
              <el-tag type="danger">
                {{ row.err.message }}
              </el-tag>
            </div>
            <br>
            <div>
              <span class="message-title" style="padding-right: 10px;">{{ $t('error_log.info') }}: </span>
              <el-tag type="warning">
                {{ tag(row.vm) }} : {{ row.info }}
              </el-tag>
            </div>
            <br>
            <div>
              <span class="message-title" style="padding-right: 16px;">{{ $t('error_log.url') }}: </span>
              <el-tag type="success">
                {{ row.url }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('error_log.cstack')">
          <template slot-scope="scope">
            {{ scope.row.err.stack }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ErrorLog',
  data() {
    return {
      dialogTableVisible: false
    }
  },
  computed: {
    errorLogs() {
      return this.$store.getters.errorLogs
    }
  },
  methods: {
    tag(vm) {
      return vm?.$vnode?.tag || vm
    },
    clearAll() {
      this.dialogTableVisible = false
      this.$store.dispatch('errorLog/clearErrorLog')
    }
  }
}
</script>

<style scoped>
.message-title {
  font-size: 16px;
  color: #333;
  font-weight: bold;
  padding-right: 8px;
}
</style>
