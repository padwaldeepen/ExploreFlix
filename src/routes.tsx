import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import {MovieCardList} from './pages/Dashboard';

export const CustomRoutes = () => {

    return (
<Router>
    <Routes>
        <Route path="/" element={<MovieCardList/>} />
    </Routes>
</Router>
    )

}