import { describe, expect, test } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import { nextTick } from 'vue';
import Races from '@/views/Races.vue';

async function racesWrapper() {
  const wrapper = mount(Races, {
    global: {
      stubs: {
        RouterView: { template: 'view' },
        RouterLink: RouterLinkStub
      }
    }
  });
  await nextTick();
  return wrapper;
}

describe('Races.vue', () => {
  test('should display two tabs', async () => {
    const wrapper = await racesWrapper();

    // You should have a `RouterLink` per tabs
    const links = wrapper.findAllComponents(RouterLinkStub);

    expect(links).toHaveLength(2);
    expect(links[0].text()).toBe('Pending races');
    expect(links[1].text()).toBe('Finished races');
  });
});
