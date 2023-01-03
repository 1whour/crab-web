import request from '@/utils/request'

export function createTask(data) {
  return request({
    url: '/crab/task/',
    method: 'post',
    data
  })
}
