import * as React from "react";
import { render } from "react-dom";

import "./styles.css";

type DataID = number;
type DataValue = string | number;

interface Data {
  id: DataID;
  value: DataValue;
}

const DataContext = React.createContext<Array<Data>>([]);
const anyObj: any = {};
type MarkingName = string;
type MarkingColor = string;
interface IMarkingContext {
  markings: Record<MarkingName, Array<DataID>>;
  setMarkingsIds: (MarkingName, DataID) => void;
  removeIdFromMarking: (MarkingName, DataID) => void;
  getMarkingColor: (MarkingName) => MarkingColor;
}

const MarkingContext = React.createContext<IMarkingContext>(anyObj);

const MarkingProvider = props => {
  // Initial values are obtained from the props
  const {
    markings: initialMarkings,
    markingColors: initalMarkingColor,
    children
  } = props;

  // Use State to keep the values
  const [markings, setMarkings] = React.useState(initialMarkings);

  const [markingColors, setMarkingColors] = React.useState(initalMarkingColor);

  const getMarkingColor = name => {
    const color = markingColors[name];
    return color ? color : "red";
  };

  const setMarkingsIds = (name, ids) => {
    setMarkings({ ...markings, [name]: markings[name].concat(ids) });
  };

  const removeIdFromMarking = (name, ids) => {
    setMarkings({ ...markings, [name]: markings[name].filter(v => v != ids) });
  };

  const addNewMarking = markingName => {
    const newMarking = {
      id: new Date().getTime().toString(),
      name: markingName
    };

    setMarkings(markings.concat([newMarking]));
  };

  // Make the context object:
  const markingContext = {
    markings,
    removeIdFromMarking,
    setMarkings,
    setMarkingsIds,
    addNewMarking,
    markingColors,
    getMarkingColor,
    setMarkingColors
  };

  // pass the value in provider and return
  return (
    <MarkingContext.Provider value={markingContext}>
      {children}
    </MarkingContext.Provider>
  );
};

const useData = () => React.useContext(DataContext);
const useMarkings = () => React.useContext(MarkingContext);

const Cell = ({
  id,
  marking,
  value
}: {
  id: DataID;
  marking?: MarkingName;
  value: DataValue;
}) => {
  const [isMarkedLocally, setMarked] = React.useState(false);
  const toggleMark = () => setMarked(!isMarkedLocally);

  const {
    markings,
    setMarkingsIds,
    removeIdFromMarking,
    getMarkingColor
  } = useMarkings();

  const getStyle = React.useCallback(() => {
    if (marking && markings[marking].includes(id)) {
      return { backgroundColor: getMarkingColor(marking) };
    }
    return undefined;
  }, [id, marking, markings]);

  const handleClick = React.useCallback(() => {
    if (marking) {
      if (isMarkedLocally) {
        removeIdFromMarking(marking, id);
      } else {
        setMarkingsIds(marking, [id]);
      }
      toggleMark();
    }
  }, [id, marking, isMarkedLocally]);

  return (
    <button onClick={handleClick} style={getStyle()}>
      {value}
    </button>
  );
};

const Row = ({ ids, marking, filterMarking }) => {
  const data = useData();
  const { markings } = useMarkings();
  const filteredIds = markings[filterMarking];

  const isFiltered = React.useCallback(id => filteredIds.includes(id), [
    filteredIds
  ]);

  const Cells = data.map(
    v =>
      ids.includes(v.id) &&
      !isFiltered(v.id) && <Cell marking={marking} id={v.id} value={v.value} />
  );

  return <div style={{ display: "flex", flexDirection: "row" }}>{Cells} </div>;
};

function App() {
  const markings = { a: [], b: [], globala: [], globalb: [] };
  const markingColors = {
    a: "blue",
    b: "green",
    globala: "red",
    globalb: "violet"
  };
  const data = [
    { id: 0, value: 0 },
    { id: 1, value: 1 },
    { id: 2, value: 2 },
    { id: 3, value: 3 },
    { id: 4, value: 4 },
    { id: 5, value: 5 },
    { id: 6, value: 6 },
    { id: 7, value: 7 }
  ];
  return (
    <DataContext.Provider value={data}>
      <MarkingProvider markings={markings} markingColors={markingColors}>
        <div className="App">
          <h2>Marking A</h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Row ids={[0, 1, 2, 3]} marking="a" filterMarking="globala" />
            <Row ids={[2, 3, 4, 5]} marking="a" filterMarking="globala" />
            <Row ids={[2, 6, 7, 5]} marking="a" filterMarking="globala" />
            <Row
              ids={[1, 2, 3, 4, 5, 6, 7]}
              marking="globala"
              filterMarking="a"
            />
          </div>
          <h2>Marking B</h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Row ids={[0, 1, 2, 3]} marking="b" filterMarking="globalb" />
            <Row ids={[2, 3, 4, 5]} marking="b" filterMarking="globalb" />
            <Row ids={[2, 6, 7, 5]} marking="b" filterMarking="globalb" />
            <Row
              ids={[1, 2, 3, 4, 5, 6, 7]}
              marking="globalb"
              filterMarking="b"
            />
          </div>
        </div>
      </MarkingProvider>
    </DataContext.Provider>
  );
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);
