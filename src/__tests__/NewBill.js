/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import {localStorageMock} from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event"
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I submit a new Bill", () => {
    // Vérifie que le bill se sauvegarde
    test("Then must save the bill", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
  
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))
  
      const html = NewBillUI()
      document.body.innerHTML = html
  
      const newBillInit = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
  
      const formNewBill = screen.getByTestId("form-new-bill")
      expect(formNewBill).toBeTruthy()
      
      const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    });

    // Récupère et vérifie les bills
    test("Then fetches bills from mock API POST", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
    })

    // Vérifie si un fichier est bien chargé
    test("Then verify the file bill", async() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          "localStorage",
          { value: localStorageMock }
      )
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee",
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH['NewBill']} })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))

      const newBillInit = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })

      const file = new File(['image'], 'image.png', {type: 'image/png'});
      const handleChangeFile = jest.fn((e) => newBillInit.handleChangeFile(e));
      const formNewBill = screen.getByTestId("form-new-bill")
      const billFile = screen.getByTestId('file');

      billFile.addEventListener("change", handleChangeFile);     

      await waitFor(() => {
        userEvent.upload(billFile, file)
      })
      expect(billFile.files[0].name).toBeDefined()
      expect(handleChangeFile).toBeCalled()
     
      const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
      formNewBill.addEventListener("submit", handleSubmit);     
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    })
  })
})
