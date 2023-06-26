/**
 * @jest-environment jsdom
 */
import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES,ROUTES_PATH } from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import "@testing-library/jest-dom"
import Bills from "../containers/Bills.js"
import userEvent from "@testing-library/user-event"
import router from "../app/Router.js"
// Mock l'API en récuperant mockStore pour la simuler (tests plus rapides et moins fragiles)
jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    // Vérifie si l'icône est surligné
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      // Met à jour la valeur de la clé "user"
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")

      root.setAttribute("id", "root")
      document.body.append(root)
      router()
   
      window.onNavigate(ROUTES_PATH.Bills)
     
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      // On vérifie si windowIcon a cette classe
      expect(windowIcon).toHaveClass("active-icon")
    })

    // Vérifie le tri par date
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills})
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })})

  describe("When I click on Nouvelle note de frais", () => {
    // Vérifie si le formulaire de création de bills apparait
    test("Then the form to create a new bill appear", async () => {
       
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
     
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      // Met à jour la valeur de la clé "user"
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))
      // Récupérer l'instance de la class Bills
      const billsInit = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
       // afficher le page du rapport, cherche les données à la base de leur entré sur BillsUI.js
      document.body.innerHTML = BillsUI({ data: bills })
      // Mock de la fonction pour simuler le gestionnaire de click
      const handleClickNewBill = jest.fn(() => billsInit.handleClickNewBill ())
      // bntNewBill est une constante qui contient le bouton NewBill
      const btnNewBill = screen.getByTestId("btn-new-bill")
      // Ajout d'un écouteur sur btn appel la fonction simuler 
      btnNewBill.addEventListener("click", handleClickNewBill)
      // Simule le click sur le bouton NewBill
      userEvent.click(btnNewBill)
      // vérifie si la fonction est bien appelée 
      expect(handleClickNewBill).toHaveBeenCalled()
      // Vérifier que la page ouverte est NewBill sur le formulaire
       // Tâche asynchrones, attendra que le rappel ne génère pas d'erreur / On vérifie que cette entrée ait une étiquette de "form-new-bill"
      await waitFor(() => screen.getByTestId("form-new-bill"))
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()
    })
  })


  // Vérifie si la modale du justificatif apparait
  describe("When I click on the eye of a bill", () => {
    test("Then a modal must appear", async () => {
     
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, "localStorage", { value: localStorageMock })

      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))
   
      const billsInit = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
  
      document.body.innerHTML = BillsUI({ data: bills })
  
      const handleClickIconEye = jest.fn((icon) => billsInit.handleClickIconEye(icon))
 
      const iconEye = screen.getAllByTestId("icon-eye")
 
      const modaleFile = document.getElementById("modaleFile")
      // fn.modal est une fonction de bootstrap qui permet de faire apparaitre la modale
      $.fn.modal = jest.fn(() => modaleFile.classList.add("show"))

      iconEye.forEach((icon) => {
        icon.addEventListener("click", handleClickIconEye(icon))
        userEvent.click(icon)
        // Vérifier que le click est bien ecouté
        expect(handleClickIconEye).toHaveBeenCalled()
      })
        // Vérifier que la modal est ouvert 
      expect(modaleFile).toHaveClass("show")
    })
  })


  describe("When I navigate to Bills", () => {
    // Vérifie que la page est bien chargé
    test("Then the page show", async () => {
       // Mock de la navigation 
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
   
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
 
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))
  
      new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })    
      document.body.innerHTML = BillsUI({ data: bills })
      await waitFor(() => screen.getByText("Mes notes de frais"))
      expect(screen.getByText("Mes notes de frais")).toBeTruthy()
    })
  })

  // Intégration GET TESTS
  describe("When an error occurs on API", () => {
    // Configure la fonction d'espionnage de récupération de l'objet pour toute la suite de tests
    // beforeEach est une méthode qui permet d'exécuter une "configuration" avant chaque test
    beforeEach(() => {
      // simule la connexion sur la page Employé en définissant le localStorage
      // suit également les appels à la méthode bills
      // jest.spyOn(object, methodName) est une méthode qui permet de simuler une méthode en écoutant les appels à la méthode bills
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
    })
    // Vérifie si l'erreur 404 s'affiche bien
    test("Then fetches bills from an API and fails with 404 message error", async () => {
      // Implémentation de la class "bills" passant par le module mockstore(API mocké), simulée pour retourner la méthode "list" qui retourne une promesse rejetée
      // mockimplementationonce est une méthode qui permet de simuler une implémentation de la méthode bills
      mockStore.bills.mockImplementationOnce(() => {
        return {
          // list est une méthode qui permet de récupérer la liste des bills
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
        // error est une constante qui contient le code html de la page BillsUI pour la propriété error
        // html est une constante qui contient le code html de la page BillsUI
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html

      const message = await screen.getByText(/Erreur 404/)
      // tobetruthy permet de vérifier si l'élément existe
      expect(message).toBeTruthy()
    })
  // Vérifie si l'erreur 500 s'affiche bien
    test("Then fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
        // Variable qui contient le code html de la page BillsUI pour la propriété error
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html

      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

 

  describe("When I filter bills by Pending", () => { 
    // Vérifie si les notes de frais sont filtrées par statut
    test("Then it should display bills with Pending status", async () => {
      // Implémentation de la class "bills" passant par le module mockstore(API mocké), simulée pour retourner la méthode "list" qui retourne une promesse résolue
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.resolve(bills)
          }
        }})
        // Variable qui contient le code html de la page BillsUI
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html

      const message = await screen.getByText(/pending/i)
      expect(message).toBeTruthy()
    })
  })