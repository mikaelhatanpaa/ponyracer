# Vitest with Vue: A Comprehensive Tutorial

Vitest is a fast, modern testing framework built by the Vite team, designed to work seamlessly with Vite-based projects like Vue.js applications. It’s lightweight, supports ESM, TypeScript, and provides a Jest-like API with superior performance. This tutorial covers everything you need to know about using Vitest with Vue, including setup, writing tests, essential features, and tips and tricks.

## Table of Contents

1. [Why Use Vitest?](#why-use-vitest)
2. [Setting Up Vitest in a Vue Project](#setting-up-vitest-in-a-vue-project)
3. [Writing Your First Test](#writing-your-first-test)
4. [Testing Vue Components](#testing-vue-components)
5. [Mocking and Spying](#mocking-and-spying)
6. [Testing Vue-Specific Features](#testing-vue-specific-features)
7. [Advanced Features](#advanced-features)
8. [Tips and Tricks](#tips-and-tricks)
9. [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)
10. [Conclusion](#conclusion)

## Why Use Vitest?

Vitest is an excellent choice for testing Vue applications because:

- **Speed**: Leverages Vite’s fast dev server and esbuild for rapid test execution.
- **Seamless Integration**: Works out-of-the-box with Vite-based Vue projects.
- **Jest-Compatible API**: Familiar syntax for developers coming from Jest.
- **TypeScript Support**: First-class TypeScript and ESM support.
- **Hot Module Replacement (HMR)**: Tests re-run automatically on code changes.
- **Browser and Node Testing**: Supports both in-browser and Node.js testing.

## Setting Up Vitest in a Vue Project

### Step 1: Create a Vue Project (if not already created)

If you don’t have a Vue project, create one using Vite:

```bash
npm create vite@latest my-vue-app -- --template vue
cd my-vue-app
npm install
```

### Step 2: Install Vitest and Dependencies

Install Vitest, Vue testing utilities, and other necessary packages:

```bash
npm install -D vitest @vitejs/plugin-vue @vue/test-utils jsdom
```

- `@vitejs/plugin-vue`: Enables Vue support in Vite.
- `@vue/test-utils`: Official Vue testing library for mounting and interacting with components.
- `jsdom`: A JavaScript implementation of the DOM for Node-based testing.

### Step 3: Configure Vitest

Create a `vitest.config.js` file in the project root:

```javascript
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom', // Simulate browser environment
    globals: true, // Enable global APIs like `describe`, `it`, etc.
    setupFiles: './tests/setup.js' // Optional setup file
  }
});
```

### Step 4: Create a Setup File

Create `tests/setup.js` to configure global testing utilities:

```javascript
import { config } from '@vue/test-utils';
import { vi } from 'vitest';

// Mock global Vue plugins or utilities if needed
config.global.mocks = {
  $t: msg => msg // Mock i18n
};
```

### Step 5: Update `package.json`

Add a test script to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### Step 6: Run Tests

Create a sample test file `tests/example.test.js`:

```javascript
import { describe, it, expect } from 'vitest';

describe('Example Test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
```

Run tests:

```bash
npm run test
```

For watch mode:

```bash
npm run test:watch
```

## Writing Your First Test

Let’s write a simple test for a Vue component. Assume you have a `Counter.vue` component:

```vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 0
    };
  },
  methods: {
    increment() {
      this.count++;
    }
  }
};
</script>
```

Create a test file `tests/Counter.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Counter from '../src/components/Counter.vue';

describe('Counter.vue', () => {
  it('renders initial count', () => {
    const wrapper = mount(Counter);
    expect(wrapper.text()).toContain('Count: 0');
  });

  it('increments count when button is clicked', async () => {
    const wrapper = mount(Counter);
    await wrapper.find('button').trigger('click');
    expect(wrapper.text()).toContain('Count: 1');
  });
});
```

Run the tests:

```bash
npm run test
```

## Testing Vue Components

### Mounting Components

Use `@vue/test-utils` to mount components:

- `mount`: Renders the component with a full DOM.
- `shallowMount`: Renders only the component without its children (useful for isolating tests).

Example with `shallowMount`:

```javascript
import { shallowMount } from '@vue/test-utils';
import Counter from '../src/components/Counter.vue';

it('renders button', () => {
  const wrapper = shallowMount(Counter);
  expect(wrapper.find('button').exists()).toBe(true);
});
```

### Interacting with Components

Use methods like `trigger`, `setValue`, and `find` to simulate user interactions:

```javascript
it('updates input value', async () => {
  const wrapper = mount({
    template: '<input v-model="value" />',
    data: () => ({ value: '' })
  });
  const input = wrapper.find('input');
  await input.setValue('Hello');
  expect(wrapper.vm.value).toBe('Hello');
});
```

## Mocking and Spying

### Mocking Functions

Use `vi.fn()` to create mock functions:

```javascript
import { mount } from '@vue/test-utils';
import { vi } from 'vitest';

const mockFn = vi.fn();
const wrapper = mount({
  template: '<button @click="callMock">Click</button>',
  methods: { callMock: mockFn }
});

await wrapper.find('button').trigger('click');
expect(mockFn).toHaveBeenCalled();
```

### Mocking Modules

Mock external dependencies using `vi.mock`:

```javascript
vi.mock('axios');

import axios from 'axios';
import { mount } from '@vue/test-utils';

describe('API Component', () => {
  it('fetches data', async () => {
    axios.get.mockResolvedValue({ data: { name: 'Vue' } });
    const wrapper = mount({
      template: '<div>{{ data.name }}</div>',
      data: () => ({ data: {} }),
      async mounted() {
        this.data = (await axios.get('/api')).data;
      }
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Vue');
  });
});
```

## Testing Vue-Specific Features

### Vuex/Pinia

To test components with Vuex or Pinia, mock the store:

```javascript
import { mount } from '@vue/test-utils';
import { createStore } from 'pinia';

const store = createStore({
  id: 'counter',
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++;
    }
  }
});

it('uses Pinia store', () => {
  const wrapper = mount(
    {
      template: '<button @click="store.increment()">Increment</button>',
      setup() {
        return { store: store() };
      }
    },
    {
      global: { plugins: [store] }
    }
  );
  wrapper.find('button').trigger('click');
  expect(store().count).toBe(1);
});
```

### Vue Router

Mock Vue Router for components that use routing:

```javascript
import { mount } from '@vue/test-utils';
import { vi } from 'vitest';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: { template: '<div>Home</div>' } }]
});

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

it('navigates on click', async () => {
  const wrapper = mount(
    {
      template: '<button @click="$router.push(\'/home\')">Go</button>'
    },
    {
      global: { plugins: [router] }
    }
  );
  await wrapper.find('button').trigger('click');
  expect(wrapper.vm.$router.push).toHaveBeenCalledWith('/home');
});
```

### Testing Async Components

Use `flushPromises` to wait for async operations:

```javascript
import { mount } from '@vue/test-utils';
import { flushPromises } from '@vue/test-utils';

it('renders async data', async () => {
  const wrapper = mount({
    template: '<div>{{ data }}</div>',
    data: () => ({ data: null }),
    async mounted() {
      this.data = await Promise.resolve('Async Data');
    }
  });
  await flushPromises();
  expect(wrapper.text()).toContain('Async Data');
});
```

## Advanced Features

### Code Coverage

Enable code coverage in `vitest.config.js`:

```javascript
test: {
  coverage: {
    provider: 'v8', // or 'istanbul'
    reporter: ['text', 'html', 'lcov'],
  },
}
```

Run with coverage:

```bash
npm run test -- --coverage
```

### In-Browser Testing

Vitest supports browser-based testing. Update `vitest.config.js`:

```javascript
test: {
  environment: 'happy-dom', // or 'jsdom'
  browser: {
    enabled: true,
    name: 'chrome',
  },
}
```

Run in browser mode:

```bash
npm run test -- --browser
```

### Snapshot Testing

Use snapshots to track component output:

```javascript
it('matches snapshot', () => {
  const wrapper = mount(Counter);
  expect(wrapper.html()).toMatchSnapshot();
});
```

Update snapshots:

```bash
npm run test -- -u
```

### Parallel Testing

Vitest runs tests in parallel by default. Control concurrency:

```javascript
test: {
  maxConcurrency: 10, // Limit parallel tests
}
```

## Tips and Tricks

1. **Use `globals: true` for Cleaner Tests**:
   Avoid importing `describe`, `it`, and `expect` in every test file by enabling `globals: true` in `vitest.config.js`.

2. **Mock Global Objects**:
   Mock Vue-specific globals like `$t` (i18n) or `$router` in the setup file to avoid repetitive mocking.

3. **Leverage Watch Mode**:
   Use `npm run test:watch` during development to re-run tests on file changes.

4. **Use `vi.spyOn` for Spying**:
   Spy on methods without replacing them:

   ```javascript
   const spy = vi.spyOn(wrapper.vm, 'increment');
   await wrapper.find('button').trigger('click');
   expect(spy).toHaveBeenCalled();
   ```

5. **Test Computed Properties**:
   Access computed properties directly via `wrapper.vm`:

   ```javascript
   it('computes double count', () => {
     const wrapper = mount({
       data: () => ({ count: 2 }),
       computed: {
         double() {
           return this.count * 2;
         }
       }
     });
     expect(wrapper.vm.double).toBe(4);
   });
   ```

6. **Use `beforeEach` for Setup**:
   Reset mocks or initialize components:

   ```javascript
   beforeEach(() => {
     vi.clearAllMocks();
   });
   ```

7. **Optimize Performance**:
   Use `shallowMount` for faster tests when child components are not relevant.

8. **Debug with `wrapper.html()`**:
   Log the rendered HTML for debugging:

   ```javascript
   console.log(wrapper.html());
   ```

9. **Test Emitted Events**:
   Verify custom events:

   ```javascript
   it('emits update event', async () => {
     const wrapper = mount({
       template: '<input @input="$emit(\'update\', $event.target.value)" />'
     });
     await wrapper.find('input').setValue('Test');
     expect(wrapper.emitted('update')).toBeTruthy();
     expect(wrapper.emitted('update')[0]).toEqual(['Test']);
   });
   ```

10. **Use TypeScript**:
    Vitest supports TypeScript out-of-the-box. Ensure `tsconfig.json` includes test files:
    ```json
    {
      "include": ["src/**/*", "tests/**/*"]
    }
    ```

## Common Pitfalls and Solutions

1. **Async Issues**:

   - **Problem**: Tests fail because async operations aren’t awaited.
   - **Solution**: Use `await flushPromises()` or `await wrapper.vm.$nextTick()`.

2. **Missing Vue Plugin**:

   - **Problem**: `Unknown custom element` errors.
   - **Solution**: Ensure `@vitejs/plugin-vue` is included in `vitest.config.js`.

3. **Mocking Conflicts**:

   - **Problem**: Mocks persist across tests.
   - **Solution**: Use `vi.clearAllMocks()` in `beforeEach`.

4. **Snapshot Mismatches**:

   - **Problem**: Snapshots fail due to dynamic content.
   - **Solution**: Mock dynamic data or use `toMatchInlineSnapshot`.

5. **JSDOM Limitations**:
   - **Problem**: Browser-specific APIs (e.g., `localStorage`) are unavailable.
   - **Solution**: Mock them in `tests/setup.js`:
     ```javascript
     global.localStorage = {
       getItem: vi.fn(),
       setItem: vi.fn()
     };
     ```

## Conclusion

Vitest is a powerful and fast testing framework that integrates seamlessly with Vue.js projects. By following this tutorial, you can set up Vitest, write effective tests for Vue components, and leverage advanced features like mocking, snapshots, and code coverage. Use the tips and tricks to optimize your testing workflow and avoid common pitfalls. With Vitest, you can ensure your Vue applications are robust and reliable.

For further reading, check the official documentation:

- [Vitest Docs](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)

Happy testing!

---

## Additional Examples of Useful Tests and Test Patterns

This section assumes you have a Vue project set up with Vitest and `@vue/test-utils` as described in the previous tutorial. Each example includes a brief explanation, the test code, and the relevant test pattern it demonstrates.

### 1. Testing a Form Component with Validation

**Scenario**: Test a form component that validates user input and displays error messages.

**Component** (`Form.vue`):

```vue
<template>
  <form @submit.prevent="submit">
    <input v-model="form.name" placeholder="Name" />
    <p v-if="errors.name" class="error">{{ errors.name }}</p>
    <button type="submit">Submit</button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      form: { name: '' },
      errors: { name: '' }
    };
  },
  methods: {
    submit() {
      this.errors.name = this.form.name ? '' : 'Name is required';
      if (!this.errors.name) this.$emit('submit', this.form);
    }
  }
};
</script>
```

**Test** (`tests/Form.test.js`):

```javascript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Form from '../src/components/Form.vue';

describe('Form.vue', () => {
  it('shows error when name is empty', async () => {
    const wrapper = mount(Form);
    await wrapper.find('button').trigger('submit');
    expect(wrapper.find('.error').text()).toBe('Name is required');
    expect(wrapper.emitted('submit')).toBeFalsy();
  });

  it('submits form with valid input', async () => {
    const wrapper = mount(Form);
    await wrapper.find('input').setValue('Alice');
    await wrapper.find('button').trigger('submit');
    expect(wrapper.find('.error').exists()).toBe(false);
    expect(wrapper.emitted('submit')).toBeTruthy();
    expect(wrapper.emitted('submit')[0]).toEqual([{ name: 'Alice' }]);
  });
});
```

**Test Pattern**: **Input Validation Testing**

- **Purpose**: Ensure form components handle valid and invalid inputs correctly, including error messages and event emissions.
- **Pattern**: Simulate user input with `setValue`, trigger form submission, and verify both UI feedback (error messages) and emitted events.
- **Tip**: Use `wrapper.emitted()` to verify event payloads and `find` to check for conditional UI elements.

### 2. Testing a Component with Slots

**Scenario**: Test a component that uses Vue slots to render custom content.

**Component** (`Card.vue`):

```vue
<template>
  <div class="card">
    <slot name="header">Default Header</slot>
    <slot>Default Content</slot>
  </div>
</template>
```

**Test** (`tests/Card.test.js`):

```javascript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Card from '../src/components/Card.vue';

describe('Card.vue', () => {
  it('renders default slot content', () => {
    const wrapper = mount(Card);
    expect(wrapper.text()).toContain('Default Header');
    expect(wrapper.text()).toContain('Default Content');
  });

  it('renders custom slot content', () => {
    const wrapper = mount(Card, {
      slots: {
        header: '<h1>Custom Header</h1>',
        default: 'Custom Body'
      }
    });
    expect(wrapper.find('h1').text()).toBe('Custom Header');
    expect(wrapper.text()).toContain('Custom Body');
  });
});
```

**Test Pattern**: **Slot Testing**

- **Purpose**: Verify that components correctly render default and custom slot content.
- **Pattern**: Use the `slots` option in `mount` to pass custom slot content and test both default and overridden cases.
- **Tip**: Use `find` to target specific slot content and `text()` to verify rendered output.

### 3. Testing a Component with Props

**Scenario**: Test a component that renders differently based on props.

**Component** (`Greeting.vue`):

```vue
<template>
  <div>
    <h1 v-if="isFormal">Dear {{ name }}</h1>
    <h1 v-else>Hi {{ name }}!</h1>
  </div>
</template>

<script>
export default {
  props: {
    name: { type: String, required: true },
    isFormal: { type: Boolean, default: false }
  }
};
</script>
```

**Test** (`tests/Greeting.test.js`):

```javascript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Greeting from '../src/components/Greeting.vue';

describe('Greeting.vue', () => {
  it('renders informal greeting by default', () => {
    const wrapper = mount(Greeting, { props: { name: 'Alice' } });
    expect(wrapper.text()).toBe('Hi Alice!');
  });

  it('renders formal greeting when isFormal is true', () => {
    const wrapper = mount(Greeting, { props: { name: 'Alice', isFormal: true } });
    expect(wrapper.text()).toBe('Dear Alice');
  });
});
```

**Test Pattern**: **Prop-Driven Rendering**

- **Purpose**: Ensure components render correctly based on different prop values.
- **Pattern**: Pass various prop combinations via the `props` option in `mount` and verify the resulting UI.
- **Tip**: Test both default prop values and explicit overrides to cover all cases.

### 4. Testing a Component with Vuex Store

**Scenario**: Test a component that interacts with a Vuex store.

**Component** (`TodoList.vue`):

```vue
<template>
  <div>
    <ul>
      <li v-for="todo in todos" :key="todo.id">{{ todo.text }}</li>
    </ul>
    <button @click="addTodo">Add Todo</button>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  computed: {
    ...mapState(['todos'])
  },
  methods: {
    ...mapActions(['addTodo'])
  }
};
</script>
```

**Test** (`tests/TodoList.test.js`):

```javascript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import TodoList from '../src/components/TodoList.vue';

describe('TodoList.vue', () => {
  const createTestStore = () =>
    createStore({
      state: { todos: [{ id: 1, text: 'Buy milk' }] },
      actions: {
        addTodo: vi.fn()
      }
    });

  it('renders todos from store', () => {
    const store = createTestStore();
    const wrapper = mount(TodoList, {
      global: { plugins: [store] }
    });
    expect(wrapper.find('li').text()).toBe('Buy milk');
  });

  it('dispatches addTodo action on button click', async () => {
    const store = createTestStore();
    const wrapper = mount(TodoList, {
      global: { plugins: [store] }
    });
    await wrapper.find('button').trigger('click');
    expect(store._actions.addTodo[0]).toHaveBeenCalled();
  });
});
```

**Test Pattern**: **Store Integration Testing**

- **Purpose**: Verify that components correctly interact with Vuex or Pinia stores.
- **Pattern**: Create a mock store with `createStore`, provide it via `global.plugins`, and test state rendering and action dispatching.
- **Tip**: Mock actions with `vi.fn()` to verify behavior without modifying the actual store.

### 5. Testing a Component with Async API Calls

**Scenario**: Test a component that fetches data asynchronously.

**Component** (`UserList.vue`):

```vue
<template>
  <div>
    <p v-if="loading">Loading...</p>
    <ul v-else>
      <li v-for="user in users" :key="user.id">{{ user.name }}</li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      users: [],
      loading: true
    };
  },
  async mounted() {
    this.loading = true;
    const response = await axios.get('/api/users');
    this.users = response.data;
    this.loading = false;
  }
};
</script>
```

**Test** (`tests/UserList.test.js`):

```javascript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { flushPromises } from '@vue/test-utils';
import UserList from '../src/components/UserList.vue';
import axios from 'axios';

vi.mock('axios');

describe('UserList.vue', () => {
  it('displays loading state initially', () => {
    const wrapper = mount(UserList);
    expect(wrapper.text()).toContain('Loading...');
  });

  it('renders users after API call', async () => {
    axios.get.mockResolvedValue({ data: [{ id: 1, name: 'Alice' }] });
    const wrapper = mount(UserList);
    await flushPromises();
    expect(wrapper.find('li').text()).toBe('Alice');
    expect(wrapper.text()).not.toContain('Loading...');
  });

  it('handles API errors', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'));
    const wrapper = mount(UserList);
    await flushPromises();
    expect(wrapper.text()).toContain('Loading...'); // Stays in loading state or handle error
  });
});
```

**Test Pattern**: **Async Data Fetching**

- **Purpose**: Ensure components handle async data fetching, loading states, and errors correctly.
- **Pattern**: Mock API calls with `vi.mock`, use `flushPromises` to wait for async operations, and test all possible states (loading, success, error).
- **Tip**: Mock both resolved and rejected promises to cover success and failure cases.

### 6. Testing Event Emissions with Custom Events

**Scenario**: Test a component that emits custom events with complex payloads.

**Component** (`ColorPicker.vue`):

```vue
<template>
  <input type="color" v-model="color" @input="$emit('update:color', color)" />
</template>

<script>
export default {
  data() {
    return {
      color: '#000000'
    };
  }
};
</script>
```

**Test** (`tests/ColorPicker.test.js`):

```javascript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ColorPicker from '../src/components/ColorPicker.vue';

describe('ColorPicker.vue', () => {
  it('emits update:color event with new color', async () => {
    const wrapper = mount(ColorPicker);
    await wrapper.find('input').setValue('#ff0000');
    expect(wrapper.emitted('update:color')).toBeTruthy();
    expect(wrapper.emitted('update:color')[0]).toEqual(['#ff0000']);
  });
});
```

**Test Pattern**: **Event Emission Testing**

- **Purpose**: Verify that components emit the correct events with expected payloads.
- **Pattern**: Trigger events (e.g., `setValue`, `trigger`) and use `wrapper.emitted()` to check event names and payloads.
- **Tip**: Test edge cases, like invalid inputs, to ensure robust event handling.

### 7. Testing a Component with Dynamic Imports

**Scenario**: Test a component that uses `defineAsyncComponent` for lazy loading.

**Component** (`AsyncComponent.vue`):

```vue
<template>
  <div>
    <Suspense>
      <AsyncChild />
    </Suspense>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';

export default {
  components: {
    AsyncChild: defineAsyncComponent(() => import('./Child.vue'))
  }
};
</script>
```

**Child Component** (`Child.vue`):

```vue
<template>
  <div>Async Child</div>
</template>
```

**Test** (`tests/AsyncComponent.test.js`):

```javascript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { flushPromises } from '@vue/test-utils';
import AsyncComponent from '../src/components/AsyncComponent.vue';

describe('AsyncComponent.vue', () => {
  it('renders async child component', async () => {
    const wrapper = mount(AsyncComponent, {
      global: {
        stubs: { Suspense: false } // Render Suspense content
      }
    });
    await flushPromises();
    expect(wrapper.text()).toContain('Async Child');
  });
});
```

**Test Pattern**: **Async Component Testing**

- **Purpose**: Ensure components with dynamic imports or `Suspense` render correctly.
- **Pattern**: Use `flushPromises` to wait for async component resolution and stub `Suspense` if needed.
- **Tip**: Mock the imported component with `vi.mock` if it’s complex or external.

---

## Common Test Patterns for Vue with Vitest

These patterns are reusable strategies for structuring tests effectively:

### 1. **Arrange-Act-Assert (AAA) Pattern**

- **Description**: Structure tests with three phases: Arrange (set up the test), Act (perform the action), Assert (verify the outcome).
- **Example** (from `Form.vue` test):
  ```javascript
  it('shows error when name is empty', async () => {
    // Arrange
    const wrapper = mount(Form);
    // Act
    await wrapper.find('button').trigger('submit');
    // Assert
    expect(wrapper.find('.error').text()).toBe('Name is required');
  });
  ```
- **Benefit**: Keeps tests clear and predictable.

### 2. **Given-When-Then Pattern**

- **Description**: A variation of AAA, focusing on the context (Given), action (When), and outcome (Then). Useful for behavior-driven development (BDD).
- **Example**:
  ```javascript
  it('Given empty form, When submitted, Then shows error', async () => {
    const wrapper = mount(Form); // Given
    await wrapper.find('button').trigger('submit'); // When
    expect(wrapper.find('.error').text()).toBe('Name is required'); // Then
  });
  ```
- **Benefit**: Aligns with user stories and improves readability.

### 3. **Test Data Builder Pattern**

- **Description**: Create reusable functions to build test data or components with specific configurations.
- **Example**:

  ```javascript
  const createWrapperWithProps = (props = {}) =>
    mount(Greeting, {
      props: { name: 'Alice', ...props }
    });

  it('renders informal greeting', () => {
    const wrapper = createWrapperWithProps();
    expect(wrapper.text()).toBe('Hi Alice!');
  });

  it('renders formal greeting', () => {
    const wrapper = createWrapperWithProps({ isFormal: true });
    expect(wrapper.text()).toBe('Dear Alice');
  });
  ```

- **Benefit**: Reduces test setup duplication and makes tests more maintainable.

### 4. **Mock and Stub Pattern**

- **Description**: Mock external dependencies (e.g., APIs, stores) and stub child components to isolate the component under test.
- **Example** (from `UserList.vue` test):
  ```javascript
  vi.mock('axios');
  axios.get.mockResolvedValue({ data: [{ id: 1, name: 'Alice' }] });
  ```
- **Benefit**: Ensures tests focus on the component’s logic, not external systems.

### 5. **Snapshot Testing Pattern**

- **Description**: Use snapshots to capture and compare component output, especially for complex UI.
- **Example**:
  ```javascript
  it('matches card snapshot', () => {
    const wrapper = mount(Card, {
      slots: { default: 'Custom Content' }
    });
    expect(wrapper.html()).toMatchSnapshot();
  });
  ```
- **Benefit**: Quickly detects unintended UI changes, but use sparingly to avoid brittle tests.

### 6. **Edge Case Testing Pattern**

- **Description**: Test boundary conditions, invalid inputs, or error states.
- **Example** (from `UserList.vue` test):
  ```javascript
  it('handles API errors', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'));
    const wrapper = mount(UserList);
    await flushPromises();
    expect(wrapper.text()).toContain('Loading...');
  });
  ```
- **Benefit**: Improves component robustness by covering failure modes.

---

## Tips for Writing Effective Tests

1. **Group Related Tests with `describe`**:
   Use nested `describe` blocks to organize tests by feature or component state:

   ```javascript
   describe('Counter.vue', () => {
     describe('increment button', () => {
       it('increments count', async () => {
         /* ... */
       });
       it('emits update event', async () => {
         /* ... */
       });
     });
   });
   ```

2. **Use `test.each` for Parameterized Tests**:
   Test multiple inputs efficiently:

   ```javascript
   test.each([
     { name: 'Alice', expected: 'Hi Alice!' },
     { name: 'Bob', expected: 'Hi Bob!' }
   ])('renders greeting for $name', ({ name, expected }) => {
     const wrapper = mount(Greeting, { props: { name } });
     expect(wrapper.text()).toBe(expected);
   });
   ```

3. **Leverage Setup Hooks**:
   Use `beforeEach` or `beforeAll` to reduce boilerplate:

   ```javascript
   let wrapper;
   beforeEach(() => {
     wrapper = mount(Counter);
   });
   ```

4. **Test Only Public Behavior**:
   Focus on testing the component’s public API (props, events, rendered output) rather than internal methods or state.

5. **Use Inline Snapshots**:
   For small components, use `toMatchInlineSnapshot` to keep snapshots within the test file:

   ```javascript
   expect(wrapper.html()).toMatchInlineSnapshot(`
     <div>Hi Alice!</div>
   `);
   ```

6. **Mock Timers for Time-Based Logic**:
   Use `vi.useFakeTimers` for components with timeouts or intervals:
   ```javascript
   it('updates after delay', async () => {
     vi.useFakeTimers();
     const wrapper = mount({
       template: '<div>{{ message }}</div>',
       data: () => ({ message: '' }),
       mounted() {
         setTimeout(() => (this.message = 'Delayed'), 1000);
       }
     });
     vi.advanceTimersByTime(1000);
     await wrapper.vm.$nextTick();
     expect(wrapper.text()).toBe('Delayed');
     vi.useRealTimers();
   });
   ```

---

## Conclusion

These additional test examples and patterns demonstrate how to handle common Vue.js testing scenarios, from form validation to async data fetching and Vuex integration. By applying patterns like AAA, Test Data Builder, and Edge Case Testing, you can write maintainable, robust tests that cover your application’s functionality comprehensively. Combine these with the tips from the previous tutorial (e.g., using `shallowMount`, mocking globals) to create an effective testing strategy.

For more advanced use cases, explore the [Vitest](https://vitest.dev/) and [Vue Test Utils](https://test-utils.vuejs.org/) documentation, and experiment with features like browser testing or custom matchers to further enhance your tests.

# Advanced Vitest with Vue: More Testing Examples and Patterns

This tutorial extends the previous guides on using **Vitest** with **Vue.js**, offering additional examples of useful tests and testing patterns. These examples cover advanced Vue-specific features, complex component interactions, and practical testing strategies. Each section includes a component, its test, and the corresponding test pattern, with tips for effective implementation.

## Table of Contents

1. [Testing a Component with Nested Child Components](#1-testing-a-component-with-nested-child-components)
2. [Testing a Component with Vue Transitions](#2-testing-a-component-with-vue-transitions)
3. [Testing a Component with Custom Directives](#3-testing-a-component-with-custom-directives)
4. [Testing a Component with Teleport](#4-testing-a-component-with-teleport)
5. [Testing a Component with Error Boundaries](#5-testing-a-component-with-error-boundaries)
6. [Testing a Component with Reactive Refs and Composables](#6-testing-a-component-with-reactive-refs-and-composables)
7. [Additional Testing Patterns](#7-additional-testing-patterns)
8. [Tips for Advanced Testing](#8-tips-for-advanced-testing)
9. [Conclusion](#9-conclusion)

## 1. Testing a Component with Nested Child Components

**Scenario**: Test a parent component that renders multiple child components with props and events.

**Parent Component** (`Dashboard.vue`):

```vue
<template>
  <div>
    <Widget v-for="item in items" :key="item.id" :data="item" @update="handleUpdate" />
  </div>
</template>

<script>
import Widget from './Widget.vue';

export default {
  components: { Widget },
  data() {
    return {
      items: [
        { id: 1, value: 'Item 1' },
        { id: 2, value: 'Item 2' }
      ]
    };
  },
  methods: {
    handleUpdate(id, value) {
      const item = this.items.find(i => i.id === id);
      if (item) item.value = value;
    }
  }
};
</script>
```

**Child Component** (`Widget.vue`):

```vue
<template>
  <div>
    <p>{{ data.value }}</p>
    <button @click="$emit('update', data.id, 'Updated ' + data.value)">Update</button>
  </div>
</template>

<script>
export default {
  props: {
    data: { type: Object, required: true }
  }
};
</script>
```

**Test** (`tests/Dashboard.test.js`):

```javascript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Dashboard from '../src/components/Dashboard.vue';
import Widget from '../src/components/Widget.vue';

describe('Dashboard.vue', () => {
  it('renders multiple widgets with correct props', () => {
    const wrapper = mount(Dashboard);
    const widgets = wrapper.findAllComponents(Widget);
    expect(widgets).toHaveLength(2);
    expect(widgets[0].props('data')).toEqual({ id: 1, value: 'Item 1' });
    expect(widgets[1].props('data')).toEqual({ id: 2, value: 'Item 2' });
  });

  it('updates item when widget emits update event', async () => {
    const wrapper = mount(Dashboard);
    const widget = wrapper.findComponent(Widget);
    await widget.vm.$emit('update', 1, 'Updated Item 1');
    expect(wrapper.vm.items[0].value).toBe('Updated Item 1');
    expect(wrapper.text()).toContain('Updated Item 1');
  });
});
```

**Test Pattern**: **Parent-Child Interaction Testing**

- **Purpose**: Verify that a parent component correctly renders child components and handles their emitted events.
- **Pattern**: Use `findAllComponents` to locate child components, check their props with `props()`, and simulate events with `$emit` to test parent state updates.
- **Tip**: Use `shallowMount` if you want to stub child components to isolate the parent’s logic.

## 2. Testing a Component with Vue Transitions

**Scenario**: Test a component that uses Vue’s `<Transition>` for animating elements.

**Component** (`Modal.vue`):

```vue
<template>
  <Transition name="fade">
    <div v-if="isOpen" class="modal">
      <p>Modal Content</p>
      <button @click="isOpen = false">Close</button>
    </div>
  </Transition>
</template>

<script>
export default {
  data() {
    return {
      isOpen: false
    };
  },
  methods: {
    open() {
      this.isOpen = true;
    }
  }
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

**Test** (`tests/Modal.test.js`):

```javascript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Modal from '../src/components/Modal.vue';

describe('Modal.vue', () => {
  it('does not render modal when closed', () => {
    const wrapper = mount(Modal);
    expect(wrapper.find('.modal').exists()).toBe(false);
  });

  it('renders modal when opened', async () => {
    const wrapper = mount(Modal);
    await wrapper.vm.open();
    expect(wrapper.find('.modal').exists()).toBe(true);
    expect(wrapper.text()).toContain('Modal Content');
  });

  it('closes modal when button is clicked', async () => {
    const wrapper = mount(Modal);
    wrapper.vm.isOpen = true;
    await wrapper.vm.$nextTick();
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('.modal').exists()).toBe(false);
  });
});
```

**Test Pattern**: **Transition Testing**

- **Purpose**: Ensure components with `<Transition>` correctly toggle visibility and render content.
- **Pattern**: Manipulate the component’s state to trigger transitions, use `$nextTick` to wait for DOM updates, and verify element presence.
- **Tip**: Avoid testing transition CSS (e.g., opacity) directly; focus on the functional behavior (e.g., element visibility). Mock timers with `vi.useFakeTimers` if testing transition durations.

## 3. Testing a Component with Custom Directives

**Scenario**: Test a component that uses a custom Vue directive.

**Component** (`FocusInput.vue`):

```vue
<template>
  <input v-focus type="text" v-model="value" />
</template>

<script>
export default {
  data() {
    return {
      value: ''
    };
  },
  directives: {
    focus: {
      mounted(el) {
        el.focus();
      }
    }
  }
};
</script>
```

**Test** (`tests/FocusInput.test.js`):

```javascript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FocusInput from '../src/components/FocusInput.vue';

describe('FocusInput.vue', () => {
  it('applies focus directive on mount', () => {
    const wrapper = mount(FocusInput);
    const input = wrapper.find('input');
    expect(document.activeElement).toBe(input.element);
  });

  it('updates input value', async () => {
    const wrapper = mount(FocusInput);
    await wrapper.find('input').setValue('Test');
    expect(wrapper.vm.value).toBe('Test');
  });
});
```

**Test Pattern**: **Custom Directive Testing**

- **Purpose**: Verify that custom directives apply their behavior correctly.
- **Pattern**: Mount the component, interact with the element using the directive, and check the directive’s effect (e.g., focus, class changes).
- **Tip**: Mock directive behavior with spies (`vi.spyOn`) if the directive interacts with external APIs or complex logic.

## 4. Testing a Component with Teleport

**Scenario**: Test a component that uses `<Teleport>` to render content elsewhere in the DOM.

**Component** (`Tooltip.vue`):

```vue
<template>
  <button @click="show = true">Show Tooltip</button>
  <Teleport to="body">
    <div v-if="show" class="tooltip">Tooltip Content</div>
  </Teleport>
</template>

<script>
export default {
  data() {
    return {
      show: false
    };
  }
};
</script>
```

**Test** (`tests/Tooltip.test.js`):

```javascript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Tooltip from '../src/components/Tooltip.vue';

describe('Tooltip.vue', () => {
  it('does not show tooltip initially', () => {
    const wrapper = mount(Tooltip);
    expect(wrapper.find('.tooltip').exists()).toBe(false);
  });

  it('shows tooltip when button is clicked', async () => {
    const wrapper = mount(Tooltip);
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('.tooltip').exists()).toBe(true);
    expect(wrapper.find('.tooltip').text()).toBe('Tooltip Content');
  });
});
```

**Test Pattern**: **Teleport Testing**

- **Purpose**: Ensure components using `<Teleport>` render content correctly in the target DOM location.
- **Pattern**: Mount the component, trigger the teleport condition, and verify the teleported content using `find`.
- **Tip**: JSDOM supports `<Teleport>` rendering within the test DOM, so no special configuration is needed. Focus on the component’s functional behavior.

## 5. Testing a Component with Error Boundaries

**Scenario**: Test a component that handles errors in child components using Vue’s error handling.

**Component** (`ErrorWrapper.vue`):

```vue
<template>
  <div>
    <p v-if="error">Error: {{ error.message }}</p>
    <Child v-else @error="handleError" />
  </div>
</template>

<script>
import Child from './Child.vue';

export default {
  components: { Child },
  data() {
    return {
      error: null
    };
  },
  methods: {
    handleError(err) {
      this.error = err;
    }
  }
};
</script>
```

**Child Component** (`Child.vue`):

```vue
<template>
  <button @click="throwError">Trigger Error</button>
</template>

<script>
export default {
  methods: {
    throwError() {
      this.$emit('error', new Error('Child error'));
    }
  }
};
</script>
```

**Test** (`tests/ErrorWrapper.test.js`):

```javascript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ErrorWrapper from '../src/components/ErrorWrapper.vue';

describe('ErrorWrapper.vue', () => {
  it('renders child component when no error', () => {
    const wrapper = mount(ErrorWrapper);
    expect(wrapper.find('button').exists()).toBe(true);
    expect(wrapper.find('p').exists()).toBe(false);
  });

  it('displays error message when child emits error', async () => {
    const wrapper = mount(ErrorWrapper);
    await wrapper.findComponent({ name: 'Child' }).vm.$emit('error', new Error('Child error'));
    expect(wrapper.find('p').text()).toBe('Error: Child error');
  });
});
```

**Test Pattern**: **Error Boundary Testing**

- **Purpose**: Verify that a component handles errors from child components gracefully.
- **Pattern**: Simulate errors via child component events or mocks, and check the parent’s error-handling UI.
- **Tip**: Use `vi.spyOn` to mock global error handlers (`app.config.errorHandler`) if testing Vue’s global error handling.

## 6. Testing a Component with Reactive Refs and Composables

**Scenario**: Test a component that uses the Composition API and a custom composable.

**Composable** (`useCounter.js`):

```javascript
import { ref } from 'vue';

export function useCounter(initial = 0) {
  const count = ref(initial);
  const increment = () => count.value++;
  const decrement = () => count.value--;
  return { count, increment, decrement };
}
```

**Component** (`Counter.vue`):

```vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
    <button @click="decrement">Decrement</button>
  </div>
</template>

<script>
import { useCounter } from '../src/composables/useCounter';

export default {
  setup() {
    return useCounter();
  }
};
</script>
```

**Test** (`tests/Counter.test.js`):

```javascript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Counter from '../src/components/Counter.vue';
import { useCounter } from '../src/composables/useCounter';

describe('Counter.vue', () => {
  it('renders initial count from composable', () => {
    const wrapper = mount(Counter);
    expect(wrapper.text()).toContain('Count: 0');
  });

  it('increments and decrements count', async () => {
    const wrapper = mount(Counter);
    await wrapper.findAll('button')[0].trigger('click'); // Increment
    expect(wrapper.text()).toContain('Count: 1');
    await wrapper.findAll('button')[1].trigger('click'); // Decrement
    expect(wrapper.text()).toContain('Count: 0');
  });

  it('tests composable in isolation', () => {
    const { count, increment, decrement } = useCounter(5);
    expect(count.value).toBe(5);
    increment();
    expect(count.value).toBe(6);
    decrement();
    expect(count.value).toBe(5);
  });
});
```

**Test Pattern**: **Composable Testing**

- **Purpose**: Verify that composables and components using the Composition API work as expected.
- **Pattern**: Test the composable in isolation by calling it directly, and test the component’s integration with the composable via UI interactions.
- **Tip**: Mock dependencies within composables (e.g., API calls) using `vi.mock` to isolate logic.

## 7. Additional Testing Patterns

### 7.1. **Behavior-Driven Testing (BDT) Pattern**

- **Description**: Write tests that describe user behavior in a declarative way, often using `Given-When-Then` syntax.
- **Example**:
  ```javascript
  describe('Modal.vue', () => {
    it('Given modal is closed, When user clicks button, Then modal opens', async () => {
      const wrapper = mount(Modal); // Given
      await wrapper.find('button').trigger('click'); // When
      expect(wrapper.find('.modal').exists()).toBe(true); // Then
    });
  });
  ```
- **Benefit**: Aligns tests with user stories, making them easier to understand for non-technical stakeholders.

### 7.2. **State Machine Testing Pattern**

- **Description**: Test components with distinct states (e.g., loading, success, error) by simulating transitions between them.
- **Example**:
  ```javascript
  describe('UserList.vue', () => {
    it('transitions from loading to success state', async () => {
      vi.mock('axios');
      axios.get.mockResolvedValue({ data: [{ id: 1, name: 'Alice' }] });
      const wrapper = mount(UserList);
      expect(wrapper.text()).toContain('Loading...'); // Loading state
      await flushPromises();
      expect(wrapper.find('li').text()).toBe('Alice'); // Success state
    });
  });
  ```
- **Benefit**: Ensures all state transitions are handled correctly, improving reliability.

### 7.3. **Fixture Testing Pattern**

- **Description**: Use predefined test data (fixtures) to simulate complex scenarios.
- **Example**:

  ```javascript
  const userFixture = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];

  it('renders users from fixture', async () => {
    vi.mock('axios');
    axios.get.mockResolvedValue({ data: userFixture });
    const wrapper = mount(UserList);
    await flushPromises();
    expect(wrapper.findAll('li')).toHaveLength(2);
  });
  ```

- **Benefit**: Simplifies testing of complex data structures and ensures consistency across tests.

### 7.4. **Contract Testing Pattern**

- **Description**: Test that a component adheres to a contract (e.g., expected props, events) defined by its API.
- **Example**:
  ```javascript
  it('Widget adheres to prop contract', () => {
    const wrapper = mount(Widget, {
      props: { data: { id: 1, value: 'Test' } }
    });
    expect(wrapper.props('data')).toHaveProperty('id');
    expect(wrapper.props('data')).toHaveProperty('value');
  });
  ```
- **Benefit**: Ensures components are reusable and maintain compatibility with other parts of the application.

### 7.5. **Mutation Testing Pattern**

- **Description**: Test how a component responds to state mutations, especially in reactive systems.
- **Example**:
  ```javascript
  it('updates UI when items array is mutated', async () => {
    const wrapper = mount(Dashboard);
    wrapper.vm.items.push({ id: 3, value: 'Item 3' });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Item 3');
  });
  ```
- **Benefit**: Verifies that Vue’s reactivity system correctly updates the UI.

## 8. Tips for Advanced Testing

1. **Use Custom Matchers**:
   Extend Vitest with custom matchers for Vue-specific assertions:

   ```javascript
   expect.extend({
     toHaveClass(element, className) {
       const pass = element.classes().includes(className);
       return {
         pass,
         message: () => `Expected element to ${pass ? 'not ' : ''}have class ${className}`
       };
     }
   });

   it('has correct class', () => {
     const wrapper = mount(Modal);
     expect(wrapper.find('.modal')).toHaveClass('modal');
   });
   ```

2. **Test Component Lifecycle Hooks**:
   Verify behavior in `mounted`, `updated`, etc.:

   ```javascript
   it('calls API on mount', async () => {
     vi.mock('axios');
     axios.get.mockResolvedValue({ data: [] });
     mount(UserList);
     expect(axios.get).toHaveBeenCalledWith('/api/users');
   });
   ```

3. **Mock Global Context**:
   Mock Vue’s global context (e.g., `$root`, `$parent`) for complex components:

   ```javascript
   it('accesses global context', () => {
     const wrapper = mount(Component, {
       global: {
         mocks: { $root: { someMethod: vi.fn() } }
       }
     });
     expect(wrapper.vm.$root.someMethod).toBeDefined();
   });
   ```

4. **Use `vi.stubGlobal`**:
   Stub global objects like `window` or `navigator`:

   ```javascript
   it('checks navigator API', () => {
     vi.stubGlobal('navigator', { onLine: false });
     const wrapper = mount(Component);
     expect(wrapper.text()).toContain('Offline');
   });
   ```

5. **Test Accessibility (a11y)**:
   Integrate `@testing-library/vue` for accessibility testing:

   ```javascript
   import { render, screen } from '@testing-library/vue';

   it('has accessible button', async () => {
     render(Component);
     const button = screen.getByRole('button', { name: /submit/i });
     expect(button).toBeInTheDocument();
   });
   ```

6. **Parallelize Test Suites**:
   Split large test suites into separate files and use Vitest’s `--shard` option to run them in parallel:

   ```bash
   vitest run --shard=1/3
   ```

7. **Debug with `console.log(wrapper.html())`**:
   Log the rendered DOM for quick debugging:
   ```javascript
   it('debugs DOM', () => {
     const wrapper = mount(Component);
     console.log(wrapper.html());
     expect(wrapper.text()).toContain('Expected');
   });
   ```

## 9. Conclusion

These advanced examples and patterns demonstrate how to test complex Vue.js components, including those with nested children, transitions, custom directives, teleports, error boundaries, and composables. By applying patterns like Behavior-Driven Testing, State Machine Testing, and Fixture Testing, you can create robust, maintainable test suites that cover edge cases and real-world scenarios. Combine these with the tips and patterns from the previous tutorials to build a comprehensive testing strategy.

For further exploration, refer to:

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Library Vue](https://testing-library.com/docs/vue-testing-library/intro/)

Keep experimenting with Vitest’s features, such as custom matchers and browser testing, to tailor your tests to your project’s needs. Happy testing!
