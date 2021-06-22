<template>
  <div class="app-container motitor">
    <template v-if="interfaces">
      <el-card>
        <el-row>
          <el-col :md="8">
            <h3>{{ $t("monitor.memStat") }}</h3>
            <el-progress :text-inside="true" :stroke-width="26" :percentage="getValueProgress(memStat)" :status="getVariant(memStat)"></el-progress>
            <div class="mt-1">
              {{ convertToGb(memStat.used) }}{{ $t("monitor.GB") }}/{{ convertToGb(memStat.total)}}{{ $t("monitor.GB") }}
            </div>
            <h3>{{ $t("monitor.diskStat") }}</h3>
            <el-progress class="mt-1" :text-inside="true" :stroke-width="24" :percentage="getValueProgress(diskStat)" :status="getVariant(diskStat)"></el-progress>
            <div class="mt-1">
              {{ convertToGb(diskStat.used) }}{{ $t("monitor.GB") }}/ {{ convertToGb(diskStat.total) }}{{ $t("monitor.GB") }}
            </div>
          </el-col>
        </el-row>
      </el-card>
      <el-card class="mt-2">
        <h3>{{ $t("monitor.cpuStat") }}</h3>
        <el-row v-show="false">
          <el-col :span="8" :sm="8" :md="4">
            {{ $t("monitor.name") }}:
          </el-col>
          <el-col :span="16" :sm="16" :md="8" class="info">
            {{ cpuInfo.modelName }}
          </el-col>
          <el-col :span="8" :sm="8" :md="4">
            {{ $t("monitor.cores") }}:
          </el-col>
          <el-col :span="16" :sm="16" :md="8" class="info">
            {{ cpuInfo.cores }}
          </el-col>
          <el-col :span="8" :sm="8" :md="4">
            {{ $t("monitor.frequency") }}:
          </el-col>
          <el-col :span="16" :sm="16" :md="8" class="info">
            {{ cpuInfo.mhz }} {{ $t("monitor.MHz") }}
          </el-col>
          <el-col :span="8" :sm="8" :md="4">
            {{ $t("monitor.cacheSize") }}:
          </el-col>
          <el-col :span="16" :sm="16" :md="8" class="info">
            {{ cpuInfo.cacheSize }}
          </el-col>
        </el-row>
        <CPUPecent></CPUPecent>
      </el-card>
      <el-card class="mt-2">
        <h3>{{ $t("monitor.hostStat") }}</h3>
        <el-row class="mt-2">
          <el-col :span="8" :sm="8" :md="4">
            {{ $t("monitor.hostid") }}:
          </el-col>
          <el-col :span="16" :sm="16" :md="8" class="info">
            {{ hostStat.hostid }}
          </el-col>
          <el-col :span="8" :sm="8" :md="4">
            {{ $t("monitor.hostname") }}:
          </el-col>
          <el-col :span="16" :sm="16" :md="8" class="info">
            {{ hostStat.hostname }}
          </el-col>
        </el-row>
        <el-row class="mt-2">
          <el-col :span="8" :sm="8" :md="4">
            {{ $t("monitor.uptime") }}:
          </el-col>
          <el-col :span="16" :sm="16" :md="8" class="info">
            {{ getUptime(hostStat.uptime) }}
          </el-col>
          <el-col :span="8" :sm="8" :md="4">
            {{ $t("monitor.bootTime") }}:
          </el-col>
          <el-col :span="16" :sm="16" :md="8" class="info">
            {{ hostStat.bootTime }}
          </el-col>
        </el-row>

        <el-row class="mt-2">
          <el-col :span="8" :sm="8" :md="4">
            {{ $t("monitor.processes") }}:
          </el-col>
          <el-col :span="16" :sm="16" :md="8" class="info">
            {{ hostStat.procs }}
          </el-col>
          <el-col :span="8" :sm="8" :md="4">
            {{ $t("monitor.os") }}:
          </el-col>
          <el-col :span="16" :sm="16" :md="8" class="info">
            {{ hostStat.os }}
          </el-col>
        </el-row>

        <el-row class="mt-2">
          <el-col :span="8" :sm="8" :md="4">
            {{ $t("monitor.platform") }}:
          </el-col>
          <el-col :span="16" :sm="16" :md="8" class="info">
            {{ hostStat.platform }}
          </el-col>
          <el-col :span="8" :sm="8" :md="4">
            {{ $t("monitor.os") }}:
          </el-col>
          <el-col :span="16" :sm="16" :md="8" class="info">
            {{ hostStat.os }}
          </el-col>
        </el-row>
        <el-row class="mt-2">
          <el-col :span="8" :sm="8" :md="4">
            {{ $t("monitor.platformFamily") }}:
          </el-col>
          <el-col :span="16" :sm="16" :md="8" class="info">
            {{ hostStat.platformFamily }}
          </el-col>
          <el-col :span="8" :sm="8" :md="4">
            {{ $t("monitor.platformVersion") }}:
          </el-col>
          <el-col :span="16" :sm="16" :md="8" class="info">
            {{ hostStat.platformVersion }}
          </el-col>
        </el-row>
        <el-row class="mt-2">
          <el-col :span="8" :sm="8" :md="4">
            {{ $t("monitor.kernelVersion") }}:
          </el-col>
          <el-col :span="16" :sm="16" :md="8" class="info">
            {{ hostStat.kernelVersion }}
          </el-col>
          <el-col :span="8" :sm="8" :md="4">
            {{ $t("monitor.kernelArchitecture") }}:
          </el-col>
          <el-col :span="16" :sm="16" :md="8" class="info">
            {{ hostStat.kernelArch }}
          </el-col>
        </el-row>
        <el-row class="mt-2">
          <el-col :span="8" :sm="8" :md="4">
            {{ $t("monitor.virtualizationSystem") }}:
          </el-col>
          <el-col :span="16" :sm="16" :md="8" class="info">
            {{ hostStat.virtualizationSystem }}
          </el-col>
          <el-col :span="8" :sm="8" :md="4">
            {{ $t("monitor.virtualizationRole") }}:
          </el-col>
          <el-col :span="16" :sm="16" :md="8" class="info">
            {{ hostStat.virtualizationRole }}
          </el-col>
        </el-row>
      </el-card>
      <el-card class="mt-2">
        <h3>{{ $t("monitor.interfaces") }}</h3>
        <el-table
          :data="interfaces"
          stripe
          style="width: 100%">
          <el-table-column
            prop="name"
            :label="$t('monitor.name')">
          </el-table-column>
          <el-table-column
            prop="hardwareAddress"
            :label="$t('monitor.hardwareAddress')">
          </el-table-column>
          <el-table-column
            prop="address"
            :label="$t('monitor.address')">
            <template slot-scope="scope">
              <div
                  v-for="(value, index) in scope.row.address"
                  :key="index"
              >
                  {{ value.addr }}
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>
  </div>
</template>

<script>
import { getUptime, formatBytes } from '@/utils'
import { login } from '@/request/ips/login'
import { cpuInfo, memStat, diskStat, hostStat, getInterfaces } from '@/request/ips/IpsManagerRequest'
import CPUPecent from '@/components/CPUPercent'
import { isEmpty } from 'lodash'

export default {
  name: 'Monitor',
  components: {
    CPUPecent
  },
  data() {
    return {
      caption: this.$t("monitor.caption"),
      interfaces: null,
      hostStat: null,
      diskStat: null,
      memStat: null,
      cpuInfo: null,
      errorMessage: this.$t("base.loading"),
      //interfaces
      bordered: true,
      outlined: true,
      noCollapse: true,
      striped: true,
      hover: true,
      fixed: false,
      hideSearch: true,
      hidePage: true,
      hideChangeRow: true
    }
  },
  created() {
      if(!isEmpty(localStorage.getItem('token'))) {
        this.getData()
        return
      }
      login()
        .then(() => {
          this.getData()
        })
  },
  methods: {
    getData() {
      Promise.all([
          getInterfaces(),
          hostStat(),
          diskStat(),
          memStat(),
          cpuInfo()
      ]).then(value => {
        if (!value || value.length === 0) {
          this.errorMessage = this.$t("base.noData");
          return;
        }
        if (!isEmpty(value[0].data)) {
          this.interfaces = value[0].data.data.map(val => {
            return {
              data: val,
              name: val.name,
              hardwareAddress: val.hardwareaddr,
              address: val.addrs
            };
          });
        }
        if (!isEmpty(value[1].data)) {
          this.hostStat = value[1].data.data;
        }
        if (!isEmpty(value[2].data)) {
          this.diskStat = value[2].data.data;
        }
        if (!isEmpty(value[3].data)) {
          this.memStat = value[3].data.data;
        }
        if (!isEmpty(value[4].data)) {
          this.cpuInfo = value[4].data.data[0]; //TODO fix lay gia tri dau tien lam mau
        }
      });
    },
    getUptime(time) {
      return getUptime(time);
    },
    convertToGb(value) {
      const result = formatBytes(value, "GB");
      return Number(result);
    },
    getValueProgress(value) {
      if (!value) return 0
      return (
        (this.convertToGb(value.used) * 100) /
          this.convertToGb(value.total)
      );
    },
    getVariant(value) {
      if (this.getValueProgress(value) < 50) {
        return "success";
      }
      if (this.getValueProgress(value) < 80) return "warning";
      return "exception";
    }
  }
}
</script>
