import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/crab/ui/users/list',
    method: 'get',
    params: query
  })
}

export function createUser(data) {
  return request({
    url: '/crab/ui/user',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: '/crab/ui/user',
    method: 'put',
    data
  })
}

export function deleteUser(data) {
  return request({
    url: '/crab/ui/user',
    method: 'delete',
    data
  })
}
