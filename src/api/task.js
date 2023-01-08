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

export function updateTask(data) {
  return request({
    url: '/crab/task/',
    method: 'put',
    data
  })
}

export function stopTask(data) {
  return request({
    url: '/crab/task/stop',
    method: 'patch',
    data
  })
}
export function continueTask(data) {
  return request({
    url: '/crab/task/continue',
    method: 'patch',
    data
  })
}
