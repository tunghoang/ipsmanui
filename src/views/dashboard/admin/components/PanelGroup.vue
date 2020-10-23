<template>
  <el-row :gutter="40" class="panel-group">
    <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('getUserReport')">
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon icon-class="peoples" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            {{ $t('dashboard.user') }}
          </div>
          <count-to :start-val="0" :end-val="summary.users" :duration="2600" class="card-panel-num" />
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('getUniversityReport')">
        <div class="card-panel-icon-wrapper icon-table">
          <svg-icon icon-class="table" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            {{ $t('dashboard.university') }}
          </div>
          <count-to :start-val="0" :end-val="summary.universities" :duration="2600" class="card-panel-num" />
        </div>
      </div>
    </el-col>
        <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('getSemesterReport')">
        <div class="card-panel-icon-wrapper icon-form">
          <svg-icon icon-class="form" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            {{ $t('dashboard.semester') }}
          </div>
          <count-to :start-val="0" :end-val="summary.semesters" :duration="2600" class="card-panel-num" />
        </div>
      </div>
    </el-col>
        <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('getRoomReport')">
        <div class="card-panel-icon-wrapper icon-example">
          <svg-icon icon-class="example" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            {{ $t('dashboard.room') }}
          </div>
          <count-to :start-val="0" :end-val="summary.rooms" :duration="2600" class="card-panel-num" />
        </div>
      </div>
    </el-col>
        <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('getSubjectReport')">
        <div class="card-panel-icon-wrapper icon-education">
          <svg-icon icon-class="education" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            {{ $t('dashboard.subject') }}
          </div>
          <count-to :start-val="0" :end-val="summary.subjects" :duration="2600" class="card-panel-num" />
        </div>
      </div>
    </el-col>
        <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('getExamRoomReport')">
        <div class="card-panel-icon-wrapper icon-example">
          <svg-icon icon-class="example" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            {{ $t('dashboard.examRoom') }}
          </div>
          <count-to :start-val="0" :end-val="summary.examRooms" :duration="2600" class="card-panel-num" />
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'
import rf from 'requestfactory'
import { Message } from 'element-ui'
export default {
  components: {
    CountTo
  },
  data() {
    return {
      summary: {
        // users: 203,
        // semesters: 23,
        // universities: 11,
        // rooms: 8,
        // subjects: 169,
        // studentExamRooms: 0
      }
    }
  },
  methods: {
    handleSetLineChartData(type) {
      this.$emit('handleSetLineChartData', type)
    },
    getSummaryTotal() {
      rf.getRequest('DashBoardRequest').getSummaryTotal(this.params)
      .then(async response => {
        this.summary = response.data
      })
      .catch(error => {
        this.handleError(error)
      });
    },
    handleError(error) {
      if (this.errors.has('error')) {
        this.errors.add({field: 'error', msg: error.response.data.message});
        Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
      }
    },
  },
  computed: {
    getUsers: function() {
      return this.summary.users
    }
  },
  created() {
    this.getSummaryTotal()
  }
}
</script>

<style lang="scss" scoped>
.panel-group {
  margin-top: 18px;
  .card-panel-col {
    margin-bottom: 32px;
  }
  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);
    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }
      .icon-people {
        background: #40c9c6;
      }
      .icon-table {
        background: #c2c940;
      }
      .icon-example {
        background: #36a3f7;
      }
      .icon-education {
        background: #f4516c;
      }
      .icon-form {
        background: #34bfa3
      }
    }
    .icon-people {
      color: #40c9c6;
    }
    .icon-table {
      color: #c2c940;
    }
    .icon-example {
      color: #36a3f7;
    }
    .icon-education {
      color: #f4516c;
    }
    .icon-form {
      color: #34bfa3
    }
    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }
    .card-panel-icon {
      float: left;
      font-size: 48px;
    }
    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;
      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }
      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}
@media (max-width:550px) {
  .card-panel-description {
    display: none;
  }
  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;
    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>