import { describe, expect, test } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, PropType, ref } from 'vue';
import Pagination from '@/components/Pagination.vue';

const Test = defineComponent({
  name: 'Test',
  components: { Pagination },
  props: {
    collection: {
      type: Object as PropType<Array<unknown>>,
      default: () => Array.from({ length: 100 }, (_, i) => i + 1)
    },
    currentPage: {
      type: Number,
      default: 1
    }
  },
  setup() {
    return {
      page: ref(1)
    };
  },
  template: `
    <Pagination :collection="collection" :currentPage="currentPage" @pageChange="page = $event" />
    <div id="page">{{ page }}</div>
  `
});

function testWrapper() {
  return mount(Test);
}

describe('Pagination.vue', () => {
  test('should display a button per page', async () => {
    const wrapper = testWrapper();
    const paginationWrapper = wrapper.getComponent(Pagination);

    expect(paginationWrapper.props().collection).toHaveLength(100);
    expect(paginationWrapper.props().currentPage).toBe(1);

    // it should display a previous button
    expect(wrapper.get('.previous')).not.toBeNull();
    // it should display a next button
    expect(wrapper.get('.next')).not.toBeNull();
    // it should display a button for each page
    expect(wrapper.findAll('.page')).toHaveLength(10);
    // the first page should be active
    expect(wrapper.get('.page.active').text()).toBe('1');

    // it should react to collection change
    await wrapper.setProps({ collection: Array.from({ length: 50 }, (_, i) => i + 1) });

    expect(wrapper.findAll('.page')).toHaveLength(5);

    // it should react to currentPage change
    await wrapper.setProps({ currentPage: 5 });

    expect(wrapper.get('.page.active').text()).toBe('5');
  });

  test('should emit a "pageChange" event when clicking on a page', async () => {
    const wrapper = testWrapper();
    await wrapper.setProps({ collection: Array.from({ length: 20 }, (_, i) => i + 1) });

    expect(wrapper.findAll('.page')).toHaveLength(2);
    expect(wrapper.get('.page.active').text()).toBe('1');

    const secondButton = wrapper.findAll('.page').at(1)!;

    expect(secondButton.text()).toBe('2');

    const paginationWrapper = wrapper.getComponent(Pagination);

    // click on the second page
    await secondButton.trigger('click');

    expect(paginationWrapper.emitted().pageChange).toHaveLength(1);
    expect(paginationWrapper.emitted().pageChange[0]).toStrictEqual([2]);
    expect(wrapper.get('#page').text()).toBe('2');

    // set the current page to 2
    await wrapper.setProps({ currentPage: 2 });

    // nothing is emitted if the current page is the last one and we click on the next button
    await wrapper.get('.next').trigger('click');

    expect(paginationWrapper.emitted().pageChange).toHaveLength(1);
    expect(wrapper.get('#page').text()).toBe('2');

    // click on the previous button
    await wrapper.get('.previous').trigger('click');

    expect(paginationWrapper.emitted().pageChange).toHaveLength(2);
    expect(paginationWrapper.emitted().pageChange[1]).toStrictEqual([1]);
    expect(wrapper.get('#page').text()).toBe('1');

    // set the current page to 1
    await wrapper.setProps({ currentPage: 1 });

    // click on the next button
    await wrapper.get('.next').trigger('click');

    expect(paginationWrapper.emitted().pageChange).toHaveLength(3);
    expect(paginationWrapper.emitted().pageChange[2]).toStrictEqual([2]);
    expect(wrapper.get('#page').text()).toBe('2');

    // nothing is emitted if the current page is the first one and we click on the previous button
    await wrapper.get('.previous').trigger('click');

    expect(paginationWrapper.emitted().pageChange).toHaveLength(3);
    expect(wrapper.get('#page').text()).toBe('2');
  });
});
