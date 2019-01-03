import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";

global.fetch = require("jest-fetch-mock");

jest.mock('react-native-background-fetch', () => {
  return {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    inFocusDisplaying: jest.fn()
  }
})

Enzyme.configure({ adapter: new Adapter() });
