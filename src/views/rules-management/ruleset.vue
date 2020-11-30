<template>
  <div class="app-container ruleset">
    <el-table
      :data="list"
      fit
      stripe
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="Disabled" prop="Disabled" sortable align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.Disabled }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Group" prop="Group" sortable align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.Group }}</span>
        </template>
      </el-table-column>
      <el-table-column label="SID" sortable prop="SID" align="center" width="100">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.SID }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Action" sortable prop="Action" align="center" width="100">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.Action }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Protocol" sortable prop="Protocol" align="center" width="130">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.Protocol }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Src" sortable prop="Src" align="center">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.Src }}</span>
        </template>
      </el-table-column>
      <el-table-column label="SrcPort" sortable prop="Src_Port" align="center" width="100">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.SrcPort }}</span>
        </template>
      </el-table-column>
      <el-table-column label="<->" sortable prop="Bidirection" align="center" width="100">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.Bidirection }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Dst" sortable prop="Dst" align="center" width="100">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.Dst }}</span>
        </template>
      </el-table-column>
      <el-table-column label="DstPort" sortable prop="Dst_Port" align="center" width="100">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.DstPort }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Options" sortable prop="Options" align="center" width="200">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.Options }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Classtype" sortable prop="Classtype" align="center" width="130">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.Classtype }}</span>
        </template>
      </el-table-column>
      <el-table-column label="References" sortable prop="References" align="center" width="200">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.References }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Meta" sortable prop="Metas" align="center">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.Metas }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Description" sortable prop="Description" align="center" width="200">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.Description }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Rev" sortable prop="Revision" align="center" width="100">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.Revision }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Created" sortable prop="CreationTime" align="center" width="100">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.CreationTime | timestampToDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Modified" sortable prop="Modification_Time" align="center" width="120">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.ModificationTime | timestampToDate }}</span>
        </template>
      </el-table-column>



<!--       <el-table-column :label="$t('table.actions')" fixed="right" align="center" width="200" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            {{ $t('table.edit') }}
          </el-button>
          <el-button type="danger" size="mini" @click="handleDelete(row)">
            {{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>  -->
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="params.page" :limit.sync="params.limit" @pagination="getList" />
  </div>
</template>

<script>

import { rules } from '@/request/ips/IpsManagerRequest'
import { login } from '@/request/ips/login'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'Ruleset',
  components: { Pagination },
  data () {
    return {
      list: [],
      total: 0,
      params: {
        page: 1,
        limit: 10,
        offset: 0,
        search_key: undefined,
        sort_by: 'Modification_Time',
        order_by: 'desc'
      },
    }
  },
  created () {
    if(!window._.isEmpty(localStorage.getItem('token'))) {
      this.getList()
      return
    }
    login()
      .then(() => {
        this.getList()
      })
  },
  watch: {
    'params.page'() {
      this.params.offset = this.params.page * this.params.limit
    }
  },
  methods: {
    sortChange(data) {
      const { prop, order_by } = data
        this.sortBy(prop, order_by)
    },
    getList () {
      rules(this.params)
        .then(res => {
          this.list = res.data.data
          this.total = res.data.total_items
        })
    },
    sortBy(col, order) {
      this.params.sort_by = col
      if (order === 'ascending') {
        this.params.order_by = 'asc'
      } else {
        this.params.order_by = 'desc'
      }
      this.getList()
    },
  }
}
</script>
