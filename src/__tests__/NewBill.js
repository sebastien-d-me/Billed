/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import "@testing-library/jest-dom"
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import userEvent from "@testing-library/user-event"
import router from "../app/Router.js";
import { bills } from "../fixtures/bills.js"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  // Gère le changement de pièce jointe
  describe("When I submit a new Bill", () => {
    test("Then must change the file of the bill", async () => {
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

      const file = screen.getByTestId("file")
      expect(file).toBeTruthy()

      const handleChangeFile = jest.fn((e) => newBillInit.handleChangeFile(e));
      file.addEventListener("click", handleChangeFile);
      userEvent.click(file)
      expect(handleChangeFile).toHaveBeenCalled();
    })
  })

  // Gère l'action de sauvegarde d'un bill
  describe("When I submit a new Bill", () => {
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
    })


    // Gère le POST d'un bill
    test("fetches bills from mock API POST", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Admin", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
    })

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
            window,
            "localStorage",
            { value: localStorageMock }
        )
        window.localStorage.setItem("user", JSON.stringify({
          type: "Admin",
          email: "a@a"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })
      test("Then Create the bill", async() => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        Object.defineProperty(window, "localStorage", { value: localStorageMock })
        window.localStorage.setItem("user", JSON.stringify({
          type: "Employee"
        }))

        const newBillInit = new NewBill({
          document, onNavigate, store: mockStore, localStorage: window.localStorage
        })

        const billData = {
          id: "47qAXb6fIm2zOKkLzMro",
          vat: "80",
          fileUrl: "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
          status: "pending",
          type: "Hôtel et logement",
          commentary: "séminaire billed",
          name: "encore",
          fileName: "preview-facture-free-201801-pdf-1.jpg",
          date: "2004-04-04",
          amount: 400,
          commentAdmin: "ok",
          email: "a@a",
          pct: 20,
          file: new File(['img'], 'image.png', {type: 'image/png'})
        }

        const billVat = screen.getByTestId("vat");
        const billFile = screen.getByTestId("file");

        fireEvent.change(billVat, { target: { value: billData.vat} })

        const formNewBill = screen.getByTestId("form-new-bill")
        const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
        formNewBill.addEventListener("submit", handleSubmit);

        await waitFor(() => { userEvent.upload(billFile, billData.file)})
        expect(billFile.files[0]).toBeDefined()

        fireEvent.submit(formNewBill);

        expect(handleSubmit).toHaveBeenCalled();

      })
    })
  })
})