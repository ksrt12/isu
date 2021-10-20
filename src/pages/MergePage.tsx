import ReactDOM from "react-dom";
import { NavLink } from "react-router-dom";
import { ChangeEvent, useState } from "react";
import { Idata, IJson, Imeta } from "../ts/interfaces";
import { akt2json, akt2xls, makeBaseTable, readToText, tableRow } from "../ts/utils";
import MakeBtn from "../tsx/MakeBtn";

const MergePage: React.FC = () => {
    const [disMergeBtn, setDisMergeBtn] = useState(true);
    const [disConvertBtn, setDisConvertBtn] = useState(true);
    const [disDiff, setDisDiff] = useState(true);
    const [diff, setDiff] = useState(false);
    const [mergeName, setMergeName] = useState("MERGE");
    const [filesList, setFilesList] = useState([] as IJson[]);

    let mergedData = {} as Idata;
    let dublJson = {} as Idata;
    let allInfo = {} as Imeta;

    const loadFiles = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;

        if (files) {
            try {
                for (const file of files) {
                    Promise.resolve(readToText(file)).then(parseJSON);
                }
                setDisMergeBtn(false);
            } catch (err) {
                console.log(err);
            }
            setDisDiff(!(files.length === 2));
        } else {
            clearData();
        }
    };

    const parseJSON = (str: string) => {
        const preresult: IJson = JSON.parse(str);
        setFilesList(prev => [preresult, ...prev]);
    };

    const mergeJSONs = () => {
        let dubl: string = "";

        for (const { data: newData, info: newInfo } of filesList) {
            const currInfo = allInfo;

            let key: keyof Imeta;
            for (key in newInfo) {
                if (currInfo[key] !== newInfo[key] && Object.keys(currInfo).length) {
                    console.warn(`Несовпадение ${key}!`, currInfo[key], newInfo[key]);
                }
            };
            allInfo = newInfo;

            const dublArr = Object.keys(mergedData).filter(key => !diff === Object.keys(newData).includes(key));
            for (const i of dublArr) {
                if (diff) {
                    dublJson[i] = mergedData[i];
                    dubl = `Не найден: ${i}`;
                } else {
                    dubl = `Дубликат: ${i}\n` +
                        `Предыдущее вхождение: ${mergedData[i].fac}, ${mergedData[i].usl}\n` +
                        `Текущее вхождение: ${newData[i].fac}, ${newData[i].usl}`;
                }
                console.warn(dubl);
            }
            if (dublArr.length && !diff) {
                alert("См консоль!");
            }

            mergedData = { ...newData, ...mergedData };
        };

        console.log("mergedData", mergedData);
        const url = akt2json(diff ? dublJson : { info: allInfo, data: mergedData });
        ReactDOM.render(
            <MakeBtn name={`${diff ? "Diff" : "Merged"}.json`} url={url} />,
            document.getElementById("merged")
        );
        if (!diff) {
            setDisConvertBtn(false);
        }
        setDisMergeBtn(true);
    };

    const json2xls = () => {
        const name = "Coverted.xls";
        const akt_table = makeBaseTable();
        const tbody = akt_table.querySelector("tbody")!;
        for (const [key, val] of Object.entries(mergedData)) {
            tbody.appendChild(tableRow([key, ...Object.values(val)]));
        }

        const url = akt2xls(akt_table, name);
        ReactDOM.render(
            <MakeBtn name={name} url={url} />,
            document.getElementById("converted")
        );

        setDisConvertBtn(true);
    };

    const clearData = () => {
        setFilesList([]);
        setDiff(false);
        setDisMergeBtn(true);
        setDisConvertBtn(true);
        setMergeName("MERGE");
        partClearData();
        mergedData = {};
        allInfo = {} as Imeta;

    };
    const partClearData = () => {
        ReactDOM.unmountComponentAtNode(document.getElementById("merged") as HTMLElement);
        ReactDOM.unmountComponentAtNode(document.getElementById("converted") as HTMLElement);
        dublJson = {};
    };

    const changeDiff = () => {
        setMergeName(diff ? "MERGE" : "DIFF");
        setDiff(!diff);
        partClearData();
        setDisMergeBtn(false);
        setDisConvertBtn(true);
    };


    return (<>
        <div className="license-text between">
            <p>Merge JSONs &amp; Convert to XLS</p>
            <NavLink to="/">На главную</NavLink>
        </div>
        <div id="main">
            <div className="diff">
                <input id="diff" type="checkbox" checked={diff} disabled={disDiff} onChange={changeDiff} />
                Diff
            </div>
            <input id="source" type="file" multiple accept="application/json" onChange={(event) => loadFiles(event)} />
            <div className="merge between">
                <button id="merge" disabled={disMergeBtn} onClick={mergeJSONs}>{mergeName}</button>
                <div id="merged"></div>
            </div>
            <div className="convert between">
                <button id="convert" disabled={disConvertBtn} onClick={json2xls}>JSON2XLS</button>
                <div id="converted"></div>
            </div>

        </div>
    </>);
};

export default MergePage;