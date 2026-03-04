import { Routes, Route } from 'react-router-dom'
import { CreateMobPage } from './app/pages/CreateMobPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CreateMobPage />} />
    </Routes>
  )
}
