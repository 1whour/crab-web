<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.runtime_id" placeholder="runtime id" style="width: 200px;" class="filter-item"
        @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-date-picker size="small" style="height: 40px" v-model="searchTimeRange" class="filter-item"
        type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
        align="right">></el-date-picker>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查找结果
      </el-button>

      <el-button v-waves class="filter-item" type="primary" icon="el-icon-remove" @click="handleDeleteFilter">
        删除结果
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-circle-plus-outline" @click="createDialog">
        新建任务
      </el-button>
      <!--
      <el-upload class="filter-item" action="https://jsonplaceholder.typicode.com/posts/" :on-preview="handlePreview"
        :on-remove="handleRemove" :before-remove="beforeRemove" multiple :limit="3" :on-exceed="handleExceed"
        :file-list="fileList">
        <el-button size="small" type="primary">点击上传</el-button>
        <div slot="tip" class="el-upload__tip">只能上传yaml文件，且不超过500kb</div>
      </el-upload>
      -->
    </div>

    <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;"
      @sort-change="sortChange">
      <el-table-column label="任务名" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.task_name }} </span>
        </template>
      </el-table-column>
      <el-table-column label="触发类型" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.trigger }} </span>
        </template>
      </el-table-column>
      <el-table-column label="触发条件" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.trigger_value }} </span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.status }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="create_time" width="200px" align="center">
      </el-table-column>
      <el-table-column label="更新时间" prop="update_time" width="200px" align="center">
      </el-table-column>

      <el-table-column label="runtime ID" prop="runtime_id" sortable="custom" align="center" width="140"
        :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.runtime_id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="modifyDialog(row.task)">
            编辑
          </el-button>
          <el-button v-if="row.status != 'stop'" size="mini" type="warning" @click="handleStop(row, $index)">
            停止
          </el-button>
          <el-button v-if="row.status == 'stop'" size="mini" type="success" @click="handleRecovery(row, $index)">
            继续
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row, $index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
      @pagination="getList" />


    <TaskNew v-if="dialogVisible" ref="TaskNew" @refreshGetList="getList"> </TaskNew>
  </div>
</template>

<script>
import { fetchList } from '@/api/task_list'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import TaskNew from "@/views/task/task_new"
import { deleteTask, stopTask, continueTask } from '@/api/task'

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]
// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: {
    Pagination,
    TaskNew
  },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      dialogVisible: false,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      searchTimeRange: {},
      listQuery: {
        format: "json",
        page: 1,
        limit: 10,
        start_key: '',
        username: undefined,
        type: undefined,
        sort: '+id',
        start_time: undefined,
        end_time: undefined
      },
      detailData: {
        result: "",
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      rulesData: ['admin', 'editer'],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        start_time: undefined,
        end_time: undefined,
        type: '',
        status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        username: [{ required: true, message: 'username is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      this.listQuery.start_time = this.searchTimeRange[0]
      this.listQuery.end_time = this.searchTimeRange[1]
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.listQuery.start_key = response.data.start_key
        this.total = response.data.total

        this.listLoading = false
      })
    },
    delList() {
      this.listLoading = true
      this.listQuery.start_time = this.searchTimeRange[0]
      this.listQuery.end_time = this.searchTimeRange[1]
      var tmpData = {
        start_time: this.searchTimeRange[0],
        end_time: this.searchTimeRange[1],
        runtime_id: this.runtime_id,
        page: this.listQuery.page,
        limit: this.listQuery.limit,
        need_update: true,
      }
      deleteList(tmpData).then(response => {
        this.list = response.data.items
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    modifyDialog(task) {
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.TaskNew.init(task)
        this.getList()
      })
    },
    createDialog() {
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.TaskNew.init()
      })
    },
    handleDeleteFilter() {
      this.listQuery.page = 1
      this.delList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        runtime_id: undefined,
        type: ''
      }
    },
    getResult(row) {
      this.detailData.result = row.result
      this.dialogFormVisible = true
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`);
    },

    handleRecovery(row, index) {
      continueTask({
        executer: {
          taskName: row.task_name,
        }
      }).then(() => {
        row.status = "running"
        this.list.splice(index, 1, row)

        this.getList()

        this.$notify({
          username: 'Success',
          message: 'Update Successfully',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleStop(row, index) {
      row.status = "stop"
      stopTask({
        executer: {
          taskName: row.task_name,
        }
      }).then(() => {
        this.list.splice(index, 1, row)
        this.getList()
        this.$notify({
          username: 'Success',
          message: 'Stop Successfully',
          type: 'success',
          duration: 2000
        })
      })
    },

    handleDelete(row, index) {
      deleteTask({
        executer: {
          taskName: row.task_name,
        }
      }).then(() => {
        this.list.splice(index, 1)
        this.dialogFormVisible = false
        this.$notify({
          username: 'Success',
          message: 'Update Successfully',
          type: 'success',
          duration: 2000
        })
      })
    },
    getSortClass: function (key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
