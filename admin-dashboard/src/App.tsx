import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes/AppRoutes'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#090D16] text-gray-100">
        <AppRoutes />
      </div>
    </BrowserRouter>
  )
}

export default App
