import { BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import CustomerHome from './pages/Home';
import AdminHome from './pages/admin/Home';
import AdminGear from './pages/admin/Gear';
import AdminGearDetail from './pages/admin/Gear-Details';
import AdminGearEdit from './pages/admin/Gear-Edit'

import "./index.css"
import "./pages/admin/index.css"

function App() {
  return (
    <div className="App">
    
    <Router>
        <div className="pages">
          <Routes>
            <Route path="/" element = {<CustomerHome />}></Route>

            <Route path="/admin" element = {<AdminHome />}></Route>
            <Route path="/admin/gears" element = {<AdminGear />}></Route>
            <Route path="/admin/gears/:id" element = {<AdminGearDetail />}></Route>
            <Route path="/admin/gears/edit/:id" element = {<AdminGearEdit />}></Route>
          </Routes>
        </div>
    </Router>
    </div>
    
  );
}

export default App;
