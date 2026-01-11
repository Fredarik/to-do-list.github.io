//MOCK localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

//STATE
let state = {
  items: []
};

//FUNCTIONS
const saveToStorage = () => {
  localStorage.setItem('tasks', JSON.stringify(state.items));
};

const generateId = () => 'id-' + Math.random().toString(36).substr(2, 9);

const addTask = (text) => {
  if (typeof text !== 'string') return;

  const trimmedText = text.trim();
  if (!trimmedText) return;

  const newTask = {
    id: generateId(),
    text: trimmedText,
    isDone: false
  };

  state.items.push(newTask);
  saveToStorage();
};

const toggleTaskCompletion = (id) => {
  const task = state.items.find(item => item.id === id);
  if (task) {
    task.isDone = !task.isDone;
    saveToStorage();
  }
};

const deleteTask = (id) => {
  const index = state.items.findIndex(item => item.id === id);
  if (index !== -1) {
    state.items.splice(index, 1);
    saveToStorage();
  }
};

//TESTS

//GenerateId
describe('generateId', () => {
  test('повертає рядок', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
  });

  test('id не порожній', () => {
    const id = generateId();
    expect(id.length).toBeGreaterThan(0);
  });

  test('генерує унікальні id', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });
});

//SaveToStorage
describe('saveToStorage', () => {
  beforeEach(() => {
    localStorage.setItem.mockClear();
    state.items = [{ id: '1', text: 'Тест', isDone: false }];
  });

  test('зберігає tasks у localStorage у форматі JSON', () => {
    saveToStorage();
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'tasks',
      JSON.stringify(state.items)
    );
  });
});

//AddTask
describe('addTask', () => {
  beforeEach(() => {
    state.items = [];
    localStorage.setItem.mockClear();
  });

  test('додає завдання з валідним текстом', () => {
    addTask('  Купити хліб  ');
    expect(state.items.length).toBe(1);
    expect(state.items[0].text).toBe('Купити хліб');
    expect(state.items[0].isDone).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
  });

  test('не додає завдання з порожнім рядком', () => {
    addTask('   ');
    expect(state.items.length).toBe(0);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  test('не додає завдання якщо text не рядок', () => {
    addTask(null);
    addTask(undefined);
    addTask(123);
    expect(state.items.length).toBe(0);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  test('дозволяє довгий текст', () => {
    const longText = 'a'.repeat(1000);
    addTask(longText);
    expect(state.items[0].text.length).toBe(1000);
  });
});

//ToggleTaskCompletion
describe('toggleTaskCompletion', () => {
  beforeEach(() => {
    state.items = [{ id: 'test1', text: 'Тест', isDone: false }];
    localStorage.setItem.mockClear();
  });

  test('змінює статус з false на true', () => {
    toggleTaskCompletion('test1');
    expect(state.items[0].isDone).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
  });

  test('змінює статус назад з true на false', () => {
    toggleTaskCompletion('test1');
    toggleTaskCompletion('test1');
    expect(state.items[0].isDone).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalledTimes(2);
  });

  test('не змінює стан при неіснуючому id', () => {
    toggleTaskCompletion('wrong-id');
    expect(state.items[0].isDone).toBe(false);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  test('не ламається при порожньому списку', () => {
    state.items = [];
    toggleTaskCompletion('any');
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});

//DeleteTask
describe('deleteTask', () => {
  beforeEach(() => {
    state.items = [
      { id: '1', text: 'Завдання 1', isDone: false },
      { id: '2', text: 'Завдання 2', isDone: true }
    ];
    localStorage.setItem.mockClear();
  });

  test('видаляє завдання за валідним id', () => {
    deleteTask('1');
    expect(state.items.length).toBe(1);
    expect(state.items[0].id).toBe('2');
    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
  });

  test('не змінює масив при неіснуючому id', () => {
    deleteTask('999');
    expect(state.items.length).toBe(2);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  test('не ламається при порожньому списку', () => {
    state.items = [];
    deleteTask('1');
    expect(state.items.length).toBe(0);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});
