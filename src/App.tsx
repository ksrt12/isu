import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import MergePage from "./pages/MergePage";
import "./app.scss";

const App: React.FC = () => {
    return (
        <>
            <BrowserRouter>
                <Routes >
                    <Route element={<MainPage />} path="/" />
                    <Route element={<MergePage />} path="/json2xls" />
                </Routes >
            </BrowserRouter>

            <div className="copyright">
                <a target="_blank" rel="noreferrer" href="https://vk.com/kazakovstepan">&copy; 2020-2021, kazakovstepan</a>
            </div>
        </>
    );
};

export default App;