import { mount } from '@vue/test-utils'
import HomePage from '@/views/HomePage.vue'
import { describe, expect, test, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

describe('HomePage.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  test('renders home vue', () => {
    const wrapper = mount(HomePage, {
      global: {
        stubs: ['router-link', 'ion-page', 'ion-header', 'ion-toolbar', 'ion-title', 'ion-content']
      }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
