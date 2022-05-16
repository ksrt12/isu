import { ChangeEvent, useCallback, useState } from "react";
import { NavLink } from "react-router-dom";
import { Idata, IJson, Imeta } from "../ts/interfaces";
import { akt2json, akt2xls, makeBaseTable, readToText, tableRow } from "../ts/utils";
import useBtn, { Ibtn } from "../hooks";

interface MakeBtnProps {
    btn: Ibtn;
    func: () => void;
}

const MakeBtn: React.FC<MakeBtnProps> = ({ btn, func }) => {
    return (
        <div className={`${btn.id} between`}>
            <button id={btn.id} disabled={btn.disabled} onClick={func}>{btn.name}</button>
            {btn.ready && <a href={btn.url} download={btn.fileName}>{btn.fileName}</a>}
        </div>
    );
};

const MergePage: React.FC = () => {
    const [disDiff, setDisDiff] = useState(true);
    const [diff, setDiff] = useState(false);
    const [filesList, setFilesList] = useState([] as IJson[]);
    const [mergedData, setMergedData] = useState({} as Idata);

    const convertBtn = useBtn("convert", "JSON2XLS");
    const mergeBtn = useBtn("merge", "MERGE");

    const loadFiles = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        clearData();
        if (files) {
            try {
                for (const file of files) {
                    Promise.resolve(readToText(file)).then(parseJSON);
                }
                mergeBtn.enable();
            } catch (err) {
                console.log(err);
            }
            setDisDiff(!(files.length === 2));
        }
    };

    const parseJSON = (str: string) => {
        const preresult: IJson = JSON.parse(str);
        setFilesList(prev => [preresult, ...prev]);
    };

    const mergeJSONs = useCallback((/*filesList: IJson[]*/) => {
        let dubl: string = "";
        let allInfo = {} as Imeta;
        let dublJson = {} as Idata;

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
            setMergedData({ ...mergedData, ...newData });
        };

        console.log("mergedData", mergedData);
        const url = akt2json(diff ? dublJson : { info: allInfo, data: mergedData });
        mergeBtn.update(`${diff ? "Diff" : "Merged"}.json`, url);
        if (!diff) {
            convertBtn.enable();
        }
        mergeBtn.disable();
    }, [convertBtn, diff, filesList, mergeBtn, mergedData]);

    const json2xls = useCallback(() => {
        const name = "Coverted.xls";
        const akt_table = makeBaseTable();
        const tbody = akt_table.querySelector("tbody")!;
        for (const [key, val] of Object.entries(mergedData)) {
            tbody.appendChild(tableRow([key, ...Object.values(val)]));
        }

        const url = akt2xls(akt_table, name);
        convertBtn.update(name, url);
        convertBtn.disable();
    }, [convertBtn, mergedData]);

    const clearData = () => {
        setFilesList([]);
        setDiff(false);
        mergeBtn.disable();
        convertBtn.disable();
        mergeBtn.setName("MERGE");
        partClearData();
        setMergedData({});
    };

    const partClearData = () => {
        mergeBtn.remove();
        convertBtn.remove();
    };

    const changeDiff = () => {
        mergeBtn.setName(diff ? "MERGE" : "DIFF");
        setDiff(!diff);
        partClearData();
        mergeBtn.enable();
        convertBtn.disable();
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
            <input id="source" type="file" multiple accept="application/json" onChange={loadFiles} />
            <MakeBtn btn={mergeBtn} func={mergeJSONs} />
            <MakeBtn btn={convertBtn} func={json2xls} />
        </div>
    </>);
};

export default MergePage;