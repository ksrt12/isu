import { NavLink } from "react-router-dom";

interface MainPageProps { }

const MainPage: React.FC<MainPageProps> = () => {
    return (
        <>
            <div className="license-text between">
                <p>UserScripts for ISU &amp; ABIT systems</p>
            </div>
            <ul>
                <p>Перед использованием скриптов установить <a target="_blank" rel="noreferrer" href="https://www.tampermonkey.net/">Tampermonkey</a></p>
                <li><a href="abit.user.js">Система Абитуриент</a></li>
                <li><a href="gto.user.js">Проверка ГТО</a></li>
                <br />
                <li><a href="akt.user.js">Акты</a></li>
                <li><a href="de.user.js">Описи</a></li>
                <li><a href="dip.user.js">Средний балл (по приложению к диплому)</a></li>
                <li><a href="ias.user.js">Средний балл (по зачётной книжке)</a></li>
                <br />
                <li><NavLink to="/json2xls">Конвертация json в xls</NavLink></li>
            </ul>
        </>
    );
};

export default MainPage;