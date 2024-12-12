import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, List, Checkbox, message, Spin, InputNumber, DatePicker } from "antd";
import { IPerfil, IParticipante } from "../../shared/models/models";
import moment from "moment";

interface RegistrarPerfilProps {
  isModalOpen: boolean;
  onClose: () => void;
  onRegister: (perfil: Omit<IPerfil, "id">) => Promise<void>;
  onUpdate: (perfil: IPerfil) => Promise<void>;
  perfil?: IPerfil | null;
}
const tiposProyectoOptions = [
  "Educación",
  "Prevención de violencia",
  "Medioambiente",
  "Atención a adultos mayores",
  "Salud",
  "Atención a niños",
  "Otro",
];


export const RegistrarPerfil: React.FC<RegistrarPerfilProps> = ({
  isModalOpen,
  onClose,
  onRegister,
  onUpdate,
  perfil,
}) => {
  const [perfilData, setPerfilData] = useState<Omit<IPerfil, "id" | "participantes" | "tipo_proyecto">>({
    nombre_proyecto: "",
    lugar_implementacion: "",
    cant_beneficiarios: 0,
    fechas_implementacion: [],
    costo_total_psc: { valor_financiado: 0, otros_aportes: 0, costo_total: 0 },
    descripcion_problema: "",
    descripcion_acciones: "",
    lider_coordinador: "",
  });
  const [tipoProyecto, setTipoProyecto] = useState<string[]>([]);
  const [participantes, setParticipantes] = useState<IParticipante[]>([]);
  const [isAddingParticipante, setIsAddingParticipante] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [participanteForm] = Form.useForm();
  const [perfilForm] = Form.useForm();

  // Rellenar el formulario si el perfil es proporcionado
  useEffect(() => {
    if (perfil) {
      console.log("la data del perfil actualizado: ", perfil);
  
      // Convertir las fechas de implementación a objetos moment
      const fechasImplementacion = perfil.fechas_implementacion.map((fecha) => moment(fecha));
  
      setPerfilData({
        nombre_proyecto: perfil.nombre_proyecto,
        lugar_implementacion: perfil.lugar_implementacion,
        cant_beneficiarios: perfil.cant_beneficiarios,
        fechas_implementacion: perfil.fechas_implementacion, // Mantener como string en el estado
        costo_total_psc: perfil.costo_total_psc,
        descripcion_problema: perfil.descripcion_problema,
        descripcion_acciones: perfil.descripcion_acciones,
        lider_coordinador: perfil.lider_coordinador,
      });
  
      setParticipantes(perfil.participantes);
      setTipoProyecto(perfil.tipo_proyecto);
  
      // Establecer los valores en el formulario
      perfilForm.setFieldsValue({
        ...perfil,
        fecha_inicio: fechasImplementacion[0], // Primera fecha
        fecha_fin: fechasImplementacion[1],   // Segunda fecha
        "costo_total_psc.valor_financiado": perfil.costo_total_psc.valor_financiado,
        "costo_total_psc.otros_aportes": perfil.costo_total_psc.otros_aportes,
      });
    }
  }, [perfil, perfilForm]);
  
  

  const handleConfirmRegisterPerfil = () => {
    Modal.confirm({
      title: perfil ? "¿Actualizar perfil?" : "¿Registrar perfil?",
      content: perfil ? "¿Está seguro de actualizar este perfil?" : "¿Está seguro de registrar este perfil?",
      okText: "Sí",
      cancelText: "No",
      onOk: perfil ? handleUpdatePerfil : handleRegisterPerfil,
    });
  };

  const handleRegisterPerfil = async () => {
    try {
      await perfilForm.validateFields();
      if (participantes.length === 0) {
        message.error("Debe agregar al menos un participante para registrar el perfil.");
        return;
      }
      if (tipoProyecto.length === 0) {
        message.error("Debe seleccionar al menos un tipo de proyecto.");
        return;
      }
      setIsLoading(true);
      const newPerfil: Omit<IPerfil, "id"> = {
        ...perfilData,
        participantes,
        tipo_proyecto: tipoProyecto,
        fechas_implementacion: perfilData.fechas_implementacion.map((date) =>
          moment(date).format("YYYY-MM-DD")
        ),
      };
      await onRegister(newPerfil);
      resetForm();
    } catch (error) {
      console.error("Error registrando el perfil:", error);
      message.error("Ocurrió un error al registrar el perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePerfil = async () => {
    try {
      await perfilForm.validateFields();
      if (!perfil) return;
      if (participantes.length === 0) {
        message.error("Debe agregar al menos un participante para actualizar el perfil.");
        return;
      }
      if (tipoProyecto.length === 0) {
        message.error("Debe seleccionar al menos un tipo de proyecto.");
        return;
      }
      setIsLoading(true);
      const updatedPerfil: IPerfil = {
        ...perfil,
        ...perfilData,
        participantes,
        tipo_proyecto: tipoProyecto,
        fechas_implementacion: perfilData.fechas_implementacion.map((date) =>
          moment(date).format("YYYY-MM-DD")
        ),
      };
      await onUpdate(updatedPerfil);
      resetForm();
    } catch (error) {
      console.error("Error actualizando el perfil:", error);
      message.error("Ocurrió un error al actualizar el perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveParticipante = (index: number) => {
    setParticipantes((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setPerfilData({
      nombre_proyecto: "",
      lugar_implementacion: "",
      cant_beneficiarios: 0,
      fechas_implementacion: [],
      costo_total_psc: { valor_financiado: 0, otros_aportes: 0, costo_total: 0 },
      descripcion_problema: "",
      descripcion_acciones: "",
      lider_coordinador: "",
    });
    setParticipantes([]);
    setTipoProyecto([]);
    perfilForm.resetFields();
    participanteForm.resetFields();
    onClose();
  };
  const handleAddParticipante = () => {
    participanteForm
      .validateFields()
      .then((values) => {
        const participante: IParticipante = { ...values };
        setParticipantes((prev) => [...prev, participante]);
        participanteForm.resetFields();
        setIsAddingParticipante(false);
      })
      .catch((error) => {
        console.error("Error al agregar participante:", error);
      });
  };  

  const handleCancel = () => {
    if (
      perfilForm.isFieldsTouched() ||
      participanteForm.isFieldsTouched() ||
      participantes.length > 0 ||
      tipoProyecto.length > 0
    ) {
      Modal.confirm({
        title: "Confirmar cierre",
        content: "Hay datos sin guardar, ¿realmente desea cerrar? Se perderán todos los datos.",
        okText: "Sí, cerrar",
        cancelText: "Cancelar",
        onOk: resetForm,
      });
    } else {
      onClose();
    }
  };

  return (
    <Modal
    title={perfil ? "Actualizar Perfil" : "Registrar Perfil"}
    open={isModalOpen}
    onCancel={handleCancel}
    footer={
      !isAddingParticipante ? (
        [
          <Button
            key="cancel"
            onClick={handleCancel}
            style={{ backgroundColor: "#c42531", color: "white", borderColor: "#c42531" }}
          >
            Cancelar
          </Button>,
          <Button
            key="register"
            type="primary"
            style={{ backgroundColor: "#0068b1", color: "white", borderColor: "#0068b1" }}
            onClick={handleConfirmRegisterPerfil}
            disabled={isLoading}
          >
            {isLoading ? <Spin /> : perfil ? "Actualizar Perfil" : "Registrar Perfil"}
          </Button>,
        ]
      ) : null // Oculta el footer cuando isAddingParticipante es true
    }
  >
      <Form form={perfilForm} layout="vertical">
        <Form.Item
          name="nombre_proyecto"
          label="Nombre del Proyecto Social Comunitario"
          rules={[{ required: true, message: "Ingrese el nombre del proyecto." }]}
        >
          <Input
            value={perfilData.nombre_proyecto}
            onChange={(e) => setPerfilData({ ...perfilData, nombre_proyecto: e.target.value })}
          />
        </Form.Item>
        <Form.Item
          name="tipo_proyecto"
          label="Tipo de Proyecto Social Comunitario"
          rules={[{ required: true, message: "Seleccione al menos un tipo de proyecto." }]}
        >
          <Checkbox.Group
            options={tiposProyectoOptions}
            value={tipoProyecto}
            onChange={(values) => setTipoProyecto(values as string[])}
          />
        </Form.Item>
        <Form.Item
          name="lider_coordinador"
          label="Líder / Coordinador/a del equipo: "
          rules={[{ required: true, message: "Ingrese el nombre del líder o coordinador." }]}
        >
          <Input
            value={perfilData.lider_coordinador}
            onChange={(e) => setPerfilData({ ...perfilData, lider_coordinador: e.target.value })}
          />
        </Form.Item>
        <Form.Item
          name="lugar_implementacion"
          label="Lugar donde se implementará el Proyecto Social Comunitario"
          rules={[{ required: true, message: "Ingrese el lugar de implementación." }]}
        >
          <Input
            value={perfilData.lugar_implementacion}
            onChange={(e) => setPerfilData({ ...perfilData, lugar_implementacion: e.target.value })}
          />
        </Form.Item>
        <Form.Item
          name="cant_beneficiarios"
          label="Cantidad de Beneficiarios"
          rules={[{ required: true, message: "Ingrese la cantidad de beneficiarios." }]}
        >
          <InputNumber
            value={perfilData.cant_beneficiarios}
            onChange={(value) => setPerfilData({ ...perfilData, cant_beneficiarios: value || 0 })}
            min={0}
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item
  label="Fechas de Implementación (Periodo igual o mayor a 20 horas)"
  required
>
  <div style={{ display: "flex", gap: "16px" }}>
    <Form.Item
      name="fecha_inicio"
      rules={[{ required: true, message: "Seleccione la fecha de inicio." }]}
      style={{ flex: 1 }}
    >
      <DatePicker
        placeholder="Fecha de inicio"
        style={{ width: "100%" }}
        onChange={(date) =>
          setPerfilData((prevData) => ({
            ...prevData,
            fechas_implementacion: [
              date ? date.toISOString() : prevData.fechas_implementacion[1] || "",
            ],
          }))
        }
      />
    </Form.Item>
    <Form.Item
      name="fecha_fin"
      rules={[{ required: true, message: "Seleccione la fecha de fin." }]}
      style={{ flex: 1 }}
    >
      <DatePicker
        placeholder="Fecha de fin"
        style={{ width: "100%" }}
        onChange={(date) =>
          setPerfilData((prevData) => ({
            ...prevData,
            fechas_implementacion: [
              prevData.fechas_implementacion[0] || "",
              date ? date.toISOString() : "",
            ],
          }))
        }
      />
    </Form.Item>
  </div>
</Form.Item>

<Form.Item
  name="costo_total_psc.valor_financiado"
  label="Valor financiado por CMFA/USAID"
  rules={[{ required: true, message: "Ingrese el valor financiado." }]}
>
  <InputNumber
    value={perfilData.costo_total_psc.valor_financiado}
    onChange={(value) => {
      setPerfilData((prevData) => {
        const valorFinanciado = value || 0;
        const otrosAportes = prevData.costo_total_psc.otros_aportes;
        const costoTotal = valorFinanciado + otrosAportes;
        return {
          ...prevData,
          costo_total_psc: {
            valor_financiado: valorFinanciado,
            otros_aportes: otrosAportes,
            costo_total: costoTotal,
          },
        };
      });
    }}
    min={0}
    style={{ width: "100%" }}
  />
</Form.Item>
<Form.Item
  name="costo_total_psc.otros_aportes"
  label="Otros aportes gestionados"
  rules={[{ required: true, message: "Ingrese los otros aportes." }]}
>
  <InputNumber
    value={perfilData.costo_total_psc.otros_aportes}
    onChange={(value) => {
      setPerfilData((prevData) => {
        const otrosAportes = value || 0;
        const valorFinanciado = prevData.costo_total_psc.valor_financiado;
        const costoTotal = valorFinanciado + otrosAportes;
        return {
          ...prevData,
          costo_total_psc: {
            valor_financiado: valorFinanciado,
            otros_aportes: otrosAportes,
            costo_total: costoTotal,
          },
        };
      });
    }}
    min={0}
    style={{ width: "100%" }}
  />
</Form.Item>
<Form.Item label="Costo total del proyecto">
  <Input
    value={`LPS ${perfilData.costo_total_psc.costo_total.toFixed(2)}`}
    readOnly
    style={{
      width: "100%",
      backgroundColor: "#f5f5f5",
      border: "none",
    }}
  />
</Form.Item>


        <Form.Item
          name="descripcion_problema"
          label="Describa el problema identificado"
          rules={[{ required: true, message: "Ingrese la descripción del problema." }]}
        >
          <Input.TextArea
            value={perfilData.descripcion_problema}
            onChange={(e) => setPerfilData({ ...perfilData, descripcion_problema: e.target.value })}
          />
        </Form.Item>
        <Form.Item
          name="descripcion_acciones"
          label="Describa las acciones que se implementarán para resolver el problema identificado."
          rules={[{ required: true, message: "Ingrese la descripción de las acciones." }]}
        >
          <Input.TextArea
            value={perfilData.descripcion_acciones}
            onChange={(e) => setPerfilData({ ...perfilData, descripcion_acciones: e.target.value })}
          />
        </Form.Item>
        
      </Form>

      <h4>Participantes</h4>
      <List
  dataSource={participantes}
  renderItem={(participante, index) => (
    <List.Item
      actions={[
        <Button
          danger
          type="text"
          onClick={() => handleRemoveParticipante(index)}
        >
          Eliminar
        </Button>,
      ]}
    >
      <strong>{participante.nombre_completo}</strong> - DNI: {participante.no_dni}, Tel: {participante.no_telefono}
    </List.Item>
  )}
/>


      {!isAddingParticipante ? (
        <div className="w-100 d-flex justify-content-center">
          <Button
            type="dashed"
            onClick={() => setIsAddingParticipante(true)}
            style={{ marginTop: "16px", backgroundColor: "#0068b1", color: "white", borderColor: "#0068b1" }}
          >
            Agregar Participante
          </Button>
        </div>
      ) : (
        <Form form={participanteForm} layout="vertical" style={{ marginTop: "16px" }}>
          <Form.Item
            name="nombre_completo"
            label="Nombre Completo"
            rules={[{ required: true, message: "Ingrese el nombre del participante." }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="no_dni"
            label="DNI"
            rules={[{ required: true, message: "Ingrese el DNI del participante." }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="no_telefono"
            label="Teléfono"
            rules={[{ required: true, message: "Ingrese el teléfono del participante." }]}
          >
            <Input />
          </Form.Item>
          <Button
            onClick={handleAddParticipante}
            style={{ marginRight: "8px", backgroundColor: "#0068b1", color: "white", borderColor: "#0068b1" }}
          >
            Agregar
          </Button>
          <Button
            style={{ backgroundColor: "#c42531", color: "white", borderColor: "#c42531" }}
            onClick={() => setIsAddingParticipante(false)}
          >
            Cancelar
          </Button>
        </Form>
      )}
    </Modal>
  );
};
