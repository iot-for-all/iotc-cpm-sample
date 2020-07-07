function Credentials() {
    const [formState, setFormState] = React.useState({});
    const [existing, setExisting] = React.useState(true);
    const [authType, setAuthType] = React.useState(null);
    const [valid, setValid] = React.useState(false);
    const onChange = function (e) {
        setAuthType(e.currentTarget.value);
    };
    const onItemChange = function (id, val) {
        setFormState((current) => (Object.assign(Object.assign({}, current), { [id]: val })));
    };
    React.useEffect(() => {
        if (formState['device-id'] && formState['scope-id'] && formState['encryption-key'] && (formState['device-key'] || formState['group-key'])) {
            setValid(true);
        }
    }, [formState]);
    return (React.createElement("div", { style: style.container },
        React.createElement("div", { style: style.box },
            React.createElement(Title, null, "CPM Credentials Generator"),
            React.createElement("div", { style: { display: 'flex', flexDirection: 'row', justifyContent: 'space-around' } },
                React.createElement("div", null,
                    React.createElement(FormItem, { id: 'device-id', label: 'Device Id', helpText: 'The device unique Id', onChange: onItemChange.bind(null, 'device-id') }),
                    React.createElement(FormItem, { id: 'scope-id', label: 'Scope Id', helpText: 'Application scope Id', onChange: onItemChange.bind(null, 'scope-id') }),
                    React.createElement(FormItem, { id: 'encryption-key', label: 'Encryption Key', helpText: 'Encryption Key for generated credentials. This is the same value of user login password used inside the mobile application.', onChange: onItemChange.bind(null, 'encryption-key') }),
                    React.createElement(DeviceCredentials, { setExisting: setExisting }),
                    existing && React.createElement(FormItem, { id: 'device-key', label: 'Device Key', helpText: 'Connection key for the device', onChange: onItemChange.bind(null, 'device-key') }),
                    !existing && React.createElement(React.Fragment, null,
                        React.createElement(FormItem, { id: 'group-key', label: 'Group Key', helpText: 'Connection key for the application', onChange: onItemChange.bind(null, 'group-key') }),
                        React.createElement(ModelDetails, { onChange: onItemChange.bind(null, 'model-id') }))),
                React.createElement("div", null,
                    React.createElement("input", { type: 'radio', name: 'cred-type', value: 'qr', onChange: onChange }),
                    "QR Code",
                    React.createElement("input", { type: 'radio', name: 'cred-type', value: 'numeric', onChange: onChange }),
                    "Numeric Code",
                    React.createElement("div", { style: { width: '300px', height: '300px', border: '1px solid black', display: 'flex', justifyContent: 'center', alignItems: 'center' } },
                        authType === null && React.createElement("p", null, "Please select authorization type"),
                        authType !== null && React.createElement("button", { disabled: !valid }, "Generate")))))));
}
function DeviceCredentials(props) {
    const [selected, setSelected] = React.useState('existing');
    const onChange = function (e) {
        setSelected(e.currentTarget.value);
        props.setExisting(e.currentTarget.value === 'existing');
    };
    return (React.createElement("div", { id: 'device-group' },
        React.createElement("p", null, "Would you like to create a new device or use an existing one?"),
        React.createElement("input", { type: 'radio', name: 'device-group', value: 'existing', checked: selected === 'existing', onChange: onChange }),
        "Existing",
        React.createElement("input", { type: 'radio', name: 'device-group', value: 'new', checked: selected === 'new', onChange: onChange }),
        "New"));
}
function ModelDetails(props) {
    const { onChange: onModelChange } = props;
    const [selected, setSelected] = React.useState('knee');
    const [defaultValue, setDefaultValue] = React.useState(undefined);
    const onChange = function (e) {
        setSelected(e.currentTarget.value);
    };
    const getValue = function () {
        switch (selected) {
            case 'knee':
                return 'urn:continuousPatientMonitoringTemplate:Smart_Knee_Brace_5k3:1';
            case 'vitals':
                return 'urn:continuousPatientMonitoringTemplate:Smart_Vitals_Patch_220:1';
            default:
                return undefined;
        }
    };
    React.useEffect(() => {
        debugger;
        setDefaultValue(getValue());
    }, [selected]);
    return (React.createElement("div", { id: 'model-group' },
        React.createElement("p", null, "Assign to device template"),
        React.createElement("input", { type: 'radio', name: 'model-group', value: 'knee', checked: selected === 'knee', onChange: onChange }),
        "Smart Knee Brace",
        React.createElement("input", { type: 'radio', name: 'model-group', value: 'vitals', checked: selected === 'vitals', onChange: onChange }),
        "Smart Vitals Patch",
        React.createElement("input", { type: 'radio', name: 'model-group', value: 'custom', checked: selected === 'custom', onChange: onChange }),
        "Custom",
        React.createElement(FormItem, { id: 'model-id', value: defaultValue, label: 'Model Id', helpText: 'Id of the model to which assign device to.', onChange: onModelChange.bind(null, 'model-id') })));
}
function Title(props) {
    return (React.createElement("h1", { style: style.title }, props.children));
}
function Help(props) {
    return (React.createElement("div", { style: Object.assign(Object.assign({}, style.help), { top: props.position.top - 50, left: props.position.left + 50 }) },
        React.createElement("p", null, props.text)));
}
function FormItem(props) {
    const { id, label, onChange } = props;
    const [value, setValue] = React.useState('');
    const [showHelp, setShowHelp] = React.useState(false);
    const [position, setPosition] = React.useState(null);
    const onClickBody = function (e) {
        if (e.target) {
            if (e.target.closest(`#${id}-div`)) {
                return;
            }
        }
        setShowHelp(false);
    };
    React.useEffect(() => {
        document.addEventListener('click', onClickBody);
        return () => {
            document.removeEventListener('click', onClickBody);
        };
    }, []);
    return (React.createElement("div", { id: `${id}-div` },
        React.createElement("p", { style: style.label },
            label,
            React.createElement("i", { style: { marginLeft: 10, cursor: 'pointer' }, className: "material-icons md-18", onClick: (e) => {
                    setPosition(e.currentTarget.getBoundingClientRect());
                    setShowHelp((current) => (!current));
                } }, "help_outline")),
        showHelp && React.createElement(Help, { text: props.helpText, position: position }),
        React.createElement("input", { style: style.input, id: id, value: props.value ? props.value : value, readOnly: !!props.value, onChange: e => {
                setValue(e.target.value);
                onChange(e.target.value);
            } })));
}
const style = {
    container: {
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: 'url("../assets/background.jpg")',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
    },
    box: {
        display: 'flex',
        width: '50%',
        backgroundColor: 'white',
        boxShadow: '3px 3px 3px ##9E9E9E',
        borderRadius: '10px',
        flexDirection: 'column',
        padding: '40px'
    },
    title: {
        fontFamily: 'Poppins-Bold',
        alignSelf: 'center'
    },
    label: {
        marginLeft: '5px',
        marginBottom: '5px'
    },
    input: {
        width: '300px',
        paddingTop: '20px',
        border: 'none',
        borderBottom: '1px solid #9E9E9E',
        marginBottom: '20px',
    },
    help: {
        position: 'absolute',
        textAlign: 'center',
        width: '200px',
        border: '1px solid gray',
        backgroundColor: 'white',
        padding: '20px'
    }
};
const domContainer = document.querySelector('#root');
ReactDOM.render(React.createElement(Credentials), domContainer);
