<template>

  <el-dialog title="提示" :visible.sync="dialogVisible" width="100%" :before-close="handleClose">
    <div>
      <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane v-for="(item, index) in editableTabs" :label="item.label" :name="item.name">
        </el-tab-pane>
      </el-tabs>

      <div v-if="editableTabs[0].show === true">
        <el-form ref=" form" :model="form" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="任务名称">
                <el-input v-model="form.name"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="触发条件">
                <el-input placeholder="请输入内容" v-model="form.tmpTrigger" class="input-with-select">
                  <el-select v-model="form.select" slot="prepend" placeholder="请选择">
                    <el-option label="crontab表达式" value="cron"></el-option>
                    <el-option label="一次性任务" value="once"></el-option>
                  </el-select>
                  <el-button slot="append" icon="el-icon-plus"></el-button>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="执行方式">
                <el-select v-model="form.kind" placeholder="请选择method方法" class="method-select" size="big">
                  <el-option v-for="item in kindOptions" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="http/https">
                <el-select v-model="form.scheme" placeholder="请选择method方法" class="method-select" size="big">
                  <el-option v-for="item in schemeOptions" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="method">
                <el-select v-model="form.method" placeholder="请选择method方法" class="method-select" size="big">
                  <el-option v-for="item in methodOptions" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="URL">
                <el-input v-model="form.URL" class="edit-input" size="small"
                  style="float:right;margin-bottom:10px;z-index:1;position:relative" />
              </el-form-item>
            </el-col>

          </el-row>

          <el-row>
            <el-col :span="24">
              <el-form-item label="Headers">
                <el-divider></el-divider>
                <el-table :data="form.headers" style="width: 100%">

                  <el-table-column min-width="230px" label="KEY">
                    <template slot-scope="{row}">
                      <template v-if="row.edit">
                        <el-input v-model="row.name" class="edit-input" size="small"
                          style="float:right;margin-bottom:10px;z-index:1;position:relative" />
                      </template>
                      <span v-else>{{ row.name }} </span>
                    </template>
                  </el-table-column>

                  <el-table-column min-width="230px" label="VALUE">
                    <template slot-scope="{row}">
                      <template v-if="row.edit">
                        <el-input v-model="row.value" class="edit-input" size="small"
                          style="float:right;margin-bottom:10px;z-index:1;position:relative" />
                      </template>
                      <span v-else>{{ row.value }} </span>
                    </template>
                  </el-table-column>

                  <el-table-column label="操作">
                    <template slot-scope="{row,$index}">
                      <el-button-group style="float:right;margin-bottom:10px;z-index:1;position:relative">

                        <el-button v-if="row.edit" type="success" size="small" icon="el-icon-circle-check-outline"
                          @click="confirmEdit(row)">
                          Ok
                        </el-button>
                        <el-button v-else type="primary" size="small" icon="el-icon-edit" @click="row.edit = !row.edit">
                          Edit
                        </el-button>

                        <el-button type="danger" size="small" icon="el-icon-delete"
                          @click="headerHandleDelete($index, row)">删除</el-button>
                      </el-button-group>
                    </template>
                  </el-table-column>

                </el-table>
              </el-form-item>
            </el-col>
            <el-row>
              <div style="margin:20px; text-align:right">
                <el-button type="success" icon="el-icon-folder-add" @click="headerAddRow" size="small">新增</el-button>
              </div>
            </el-row>

          </el-row>

          <el-row>
            <el-col :span="24">
              <el-form-item label="body">
                <el-input type="textarea" v-model="form.body" :rows=8></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item>
            <el-button v-if="createSubmit" type="success" size="small" icon="el-icon-circle-check-outline"
              @click="onSubmit(true)">
              创建task
            </el-button>
            <el-button v-else type="primary" size="small" icon="el-icon-edit" @click="onSubmit(false)">
              更新task
            </el-button>
            <el-button type="info" size="small" icon="el-icon-cold-drink">取消</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div v-if="editableTabs[1].show === true">
        <el-form ref="form" :model="form" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="任务名称">
                <el-input v-model="form.name"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="触发条件">
                <el-input placeholder="请输入内容" v-model="form.tmpTrigger" class="input-with-select">
                  <el-select v-model="form.select" slot="prepend" placeholder="请选择">
                    <el-option label="crontab表达式" value="1234"></el-option>
                    <el-option label="一次性任务" value="1234"></el-option>
                  </el-select>
                  <el-button slot="append" icon="el-icon-plus"></el-button>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="shell脚本">
                <el-input type="textarea" v-model="form.body" :rows=8></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>
  </el-dialog>
</template>

<style>
.el-select .el-input {
  width: 140px;
}

.input-with-select .el-input-group__prepend {
  background-color: #fff;
}

.method-select {
  width: 200px;
}
</style>
<script>

import { createTask, updateTask } from '@/api/task'

export default {
  data() {
    return {
      activeName: 'first',
      editableTabs: [
        { name: "http_task", label: "创建http任务", show: true }, // 默认值
        { name: "shell_task", label: "创建shell任务", show: false },
        { name: "lambda_task", label: "创建lambda任务", show: false },
      ],
      deform: {
        name: '',
        method: 'GET',
        type: [],
        tmpTrigger: '* * * * * *',
        URL: '',
        kind: 'oneRuntime',
        select: 'cron',
        scheme: 'http',
        headers: [],
        querys: [],
      },
      form: {
        name: '',
        method: 'GET',
        type: [],
        tmpTrigger: '* * * * * *',
        URL: '',
        kind: 'oneRuntime',
        select: 'cron',
        scheme: 'http',
        headers: [],
        querys: [],
      },
      dialogVisible: false,
      createSubmit: false,
      schemeOptions: [
        {
          value: 'HTTP',
          label: 'HTTP'
        },
        {
          value: 'HTTPS',
          label: 'HTTPS'
        },
      ],
      kindOptions: [
        {
          value: 'oneRuntime',
          label: 'oneRuntime'
        },
        {
          value: 'broadcast',
          label: 'broadcast'
        },
      ],
      methodOptions: [
        {
          value: 'GET',
          label: 'GET'
        },
        {
          value: 'POST',
          label: 'POST'
        },
        {
          value: 'PUT',
          label: 'PUT'
        },
        {
          value: 'DELETE',
          label: 'DELETE'
        },
        {
          value: 'PATCH',
          label: 'PATCH'
        },
      ],
    }
  },
  methods: {
    init(row) {
      if (row) {
        this.createSubmit = false
        var executer = row.executer
        var httpObj = executer.http

        this.form.name = executer.taskName
        this.form.body = httpObj.body
        this.form.kind = row.kind
        //TODO
        this.form.URL = httpObj.host + httpObj.path
        if (row.trigger.cron) {
          this.form.select = "cron"
        }
        this.form.scheme = httpObj.scheme
        this.form.method = httpObj.method
        this.form.tmpTrigger = row.trigger.cron
      } else {
        this.createSubmit = true
      }
      console.log("createSubmit", this.createSubmit)
      this.dialogVisible = true
    },
    headerAddRow() {
      const item = {
        name: '',
        value: '',
        edit: true,
      }
      this.form.headers.push(item)
    },
    confirmEdit(row) {
      row.edit = false
      row.originalTitle = row.title
      this.$message({
        message: 'http header key 和 value已经编辑',
        type: 'success'
      })
    },
    headerHandleDelete(index, row) {
      this.form.headers.splice(index, 1)
    },
    onSubmit(create) {


      var urlObj = {}
      try {
        var url = this.form.URL
        if (this.form.URL.substr(0, 7) != "http://" && this.form.URL.substr(0, 8) != "https://") {
          url = this.form.scheme + "://" + this.form.URL
        }
        urlObj = new URL(url)
      } catch (e) {
        console.log("parse url", e, url)
      }

      if (urlObj.search) {

        const searchParams = new URLSearchParams(urlObj.search);

        // Iterating the search parameters
        searchParams.forEach((value, key) => {
          this.form.querys.push({ name: key, value: value })
          console.log(value, key);
        });

      }
      var temp = {
        apiVersion: "v0.0.1",
        kind: this.form.kind,
        action: "create",
        trigger: {
          cron: '',
          once: '',
        },
        executer: {
          taskName: this.form.name,
          http: {
            host: urlObj.hostname,
            port: Number(urlObj.port),
            path: urlObj.pathname,
            method: this.form.method,
            scheme: this.form.scheme,
            headers: this.form.headers,
            body: this.form.body
          }
        }
      }

      if (this.form.select) {
        // cron 或者once
        temp.trigger[this.form.select] = this.form.tmpTrigger
      }

      console.log("create task data", temp.executer.http)
      if (!create) {
        temp.action = "update"
        updateTask(temp)
      } else {
        createTask(temp)
      }
      this.dialogVisible = false
      this.$emit("refreshGetList")
      this.$message({
        message: '成功',
        type: 'success'
      })
      console.log('submit!', this.form.select);
    },
    handleClose(done) {
      this.createSubmit = true
      // 赋个初值
      this.form = Object.assign({}, this.deform)
      this.$emit("refreshGetList")
      done()
    },
    handleClick(el) {
      this.editableTabs[el.index].show = true
      for (var i = 0; i < this.editableTabs.length; i++) {
        if (i == el.index) {
          continue
        }
        this.editableTabs[i].show = false
      }
      console.log('handleClick!', el, this.editableTabs.length, this.editableTabs);
    }
  }
}
</script>
