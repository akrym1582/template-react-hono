import "@testing-library/jest-dom";

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!("IntersectionObserver" in globalThis)) {
  Object.assign(globalThis, {
    IntersectionObserver: MockIntersectionObserver,
  });
}
