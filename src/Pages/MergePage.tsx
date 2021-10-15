interface MergePageProps {

}

const MergePage: React.FC<MergePageProps> = () => {
    return (
        <div id="main" style={{ flexDirection: "column" }}>
            <label><input id="diff" type="checkbox" disabled onChange={() => { }} /> Diff</label>
            <div>
                <input id="source" type="file" multiple accept="application/json" onChange={() => { }} />
            </div>
            <div id="first" style={{ visibility: "hidden" }}>
                <button id="merge" className="disabled" onChange={() => { }}>MERGE</button>
            </div>
            <div id="second" style={{ visibility: "hidden" }}>
                <button id="convert" onClick={() => { }}>JSON2XLS</button>
            </div>
        </div>
    );
};

export default MergePage;