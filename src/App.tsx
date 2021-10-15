import { BrowserRouter, Switch, Route } from "react-router-dom";
import MainPage from "./Pages/MainPage";
import MergePage from "./Pages/MergePage";
import "./app.css";

const App: React.FC = () => {
    return (
        <>
            <p className="license-text">
                UserScripts for ISU  ABIT systems
            </p>
            <BrowserRouter>
                <Switch>
                    <Route component={MainPage} path="/" exact />
                    <Route component={MergePage} path="/json2xls" />
                </Switch>
            </BrowserRouter>

            <div className="copyright">
                <a href="https://vk.com/kazakovstepan">&copy; 2020-2021, kazakovstepan</a>
            </div>
        </>
    );
};

export default App;