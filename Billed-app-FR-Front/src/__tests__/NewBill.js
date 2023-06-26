/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom/extend-expect"
import { fireEvent, screen, configure } from "@testing-library/dom"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js"
import mockStore from "../__mocks__/store"
import NewBillUI from "../views/NewBillUI.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import {localStorageMock} from "../__mocks__/localStorage.js"
import userEvent from "@testing-library/user-event"
import router from "../app/Router.js"

// Mock l'API dans une constante mockStore pour la simuler (tests plus rapides et moins fragiles)
jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I submit a new Bill", () => {
    // Vérifie que le bill se sauvegarde
    test("Then must save the bill", async () => {
      // Récupération de nouvelle instance de Bills
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      // Met à jour la valeur de la clé "user"
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))
  
      const html = NewBillUI()
      document.body.innerHTML = html
      // Récupérer l'instance de la class NewBill
      const newBillInit = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
  
      const formNewBill = screen.getByTestId("form-new-bill")
      expect(formNewBill).toBeTruthy()
      // Mock de la fonction pour simuler la page
      const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
      // Ajout d'un écouteur sur '"submit"' appel la fonction simuler 
      formNewBill.addEventListener("submit", handleSubmit);
      // Simule l'intéraction soumettre
      fireEvent.submit(formNewBill);
      // vérifie si la fonction est bien appelée 
      expect(handleSubmit).toHaveBeenCalled();
    })

    test("Then show the new bill page", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
    })

    // Vérifie si un fichier est bien chargé
    test("Then verify the file bill", async() => {
      jest.spyOn(mockStore, "bills")

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }      

      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH['NewBill']} })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))

      const html = NewBillUI()
      document.body.innerHTML = html

      const newBillInit = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })

      const file = new File(['image'], 'image.png', {type: 'image/png'})
      const handleChangeFile = jest.fn((e) => newBillInit.handleChangeFile(e))
      const formNewBill = screen.getByTestId("form-new-bill")
      const billFile = screen.getByTestId('file')

      billFile.addEventListener("change", handleChangeFile)     
      userEvent.upload(billFile, file)
      
      expect(billFile.files[0].name).toBeDefined()
      expect(handleChangeFile).toBeCalled()
     
      const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e))
      formNewBill.addEventListener("submit", handleSubmit)   
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled()
    })})})