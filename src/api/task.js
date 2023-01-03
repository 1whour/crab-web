import request from '@/utils/request'

export function createTask(data) {
  return request({
    url: '/crab/task/',
    method: 'post',
    data
  })
}

export function deleteTask(data) {
  return request({
    url: '/crab/task/',
    method: 'delete',
    data
  })
}
