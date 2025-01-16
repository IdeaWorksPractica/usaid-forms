import { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Checkbox, message, Upload, List, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { IInforme, IParticipante } from "../../shared/models/models";
import { createInforme, updateInforme } from "../../shared/services/informes.service";

const tiposProyectoOptions = [
  "Educación",
  "Prevención de violencia",
  "Medioambiente",
  "Atención a adultos mayores",
  "Salud",
  "Atención a niños",
  "Otro",
];

interface RegistrarInformeProps {
  isModalOpen: boolean;
  onClose: () => void;
  onRegister: () => Promise<void>;
  onUpdate: (
    data: IInforme,
    images?: {
      antes?: File[];
      durante?: File[];
      despues?: File[];
    }
  ) => Promise<void>;
  informe?: IInforme | null;
}

export const RegistrarInforme: React.FC<RegistrarInformeProps> = ({
  isModalOpen,
  onClose,
  onRegister,
  informe,
}) => {
  const [informeData, setInformeData] = useState<Omit<IInforme, "id" | "participantes" | "fotografias" | "tipo_proyecto">>({
    nombre_proyecto: "",
    lider_coordinador: "",
    descripcion_beneficiarios: { cant_beneficiarios: 0, descripcion_beneficiarios: "" },
    descripcion_mejora: "",
    riesgo_medioambiental: [],
    medidas_reduccion_medioambiental: [],
  });
  const [tipoProyecto, setTipoProyecto] = useState<string[]>([]);
  const [participantes, setParticipantes] = useState<IParticipante[]>([]);
  const [images, setImages] = useState<{
    antes: File[];
    durante: File[];
    despues: File[];
  }>({
    antes: [],
    durante: [],
    despues: [],
  });
  const [imagesLocked, setImagesLocked] = useState<{
    antes: boolean;
    durante: boolean;
    despues: boolean;
  }>({
    antes: false,
    durante: false,
    despues: false,
  });
  const [isAddingParticipante, setIsAddingParticipante] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [informeForm] = Form.useForm();
  const [participanteForm] = Form.useForm();

  useEffect(() => {
    if (informe) {
      console.log("Informe seleccionado: ", informe);
      setInformeData({
        nombre_proyecto: informe.nombre_proyecto,
        lider_coordinador: informe.lider_coordinador,
        descripcion_beneficiarios: informe.descripcion_beneficiarios,
        descripcion_mejora: informe.descripcion_mejora,
        riesgo_medioambiental: informe.riesgo_medioambiental,
        medidas_reduccion_medioambiental: informe.medidas_reduccion_medioambiental,
      });
      setParticipantes(informe.participantes);
      setTipoProyecto(informe.tipo_proyecto);
  
      // Bloquear imágenes ya subidas
      setImagesLocked({
        antes: informe.fotografias.antes.length > 0,
        durante: informe.fotografias.durantes.length > 0,
        despues: informe.fotografias.despues.length > 0,
      });
  
      informeForm.setFieldsValue({
        nombre_proyecto: informe.nombre_proyecto,
        lider_coordinador: informe.lider_coordinador,
        tipo_proyecto: informe.tipo_proyecto,
        descripcion_mejora: informe.descripcion_mejora,
        riesgo_medioambiental: informe.riesgo_medioambiental.join(", "),
        medidas_reduccion_medioambiental: informe.medidas_reduccion_medioambiental.join(", "),
        descripcion_beneficiarios: informe.descripcion_beneficiarios.descripcion_beneficiarios,
        cant_beneficiarios: informe.descripcion_beneficiarios.cant_beneficiarios,
      });
    }
  }, [informe, informeForm]);
  

  const handleUpload = (category: "antes" | "durante" | "despues", file: File) => {
    if (imagesLocked[category]) {
      message.warning(`Las imágenes de "${category}" ya han sido subidas y no se pueden modificar.`);
      return false;
    }
    setImages((prev) => {
      if (prev[category].length >= 2) {
        message.error(`Solo se permiten 2 imágenes para la categoría "${category}".`);
        return prev;
      }
      return { ...prev, [category]: [...prev[category], file] };
    });
    return false;
  };

  const handleAddParticipante = () => {
    participanteForm
      .validateFields()
      .then((values) => {
        const participante: IParticipante = { ...values };
        setParticipantes([...participantes, participante]);
        participanteForm.resetFields();
        setIsAddingParticipante(false);
      })
      .catch((error) => console.error("Error agregando participante:", error));
  };

  const handleRemoveParticipante = (index: number) => {
    setParticipantes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirmSubmit = () => {
    if (informe) {
     handleUpdate();
      
    } else {
      handleRegister();
    }
  };

  const handleRegister = async () => {
    try {
      await informeForm.validateFields();
      setIsLoading(true);
  
      // Procesar `images` dinámicamente
      const fotografias = {
        antes: images.antes || [],
        durante: images.durante || [],
        despues: images.despues || [],
      };
  
      // Llama a la función sin incluir `fotografias` en `informeData`
      await createInforme(
        { ...informeData, tipo_proyecto: tipoProyecto, participantes },
        fotografias // Las imágenes se pasan por separado
      );
      onRegister();
      resetForm();
      message.success("Informe registrado exitosamente.");
    } catch (error) {
      message.error("Error al registrar el informe. " + error);
    } finally {
      setIsLoading(false);
    }
  };
  
  

  const handleUpdate = async () => {
    try {
      await informeForm.validateFields();
      setIsLoading(true);

      // Subir imágenes solo para categorías desbloqueadas
      const updatedImages = {
        antes: !imagesLocked.antes ? images.antes : undefined,
        durante: !imagesLocked.durante ? images.durante : undefined,
        despues: !imagesLocked.despues ? images.despues : undefined,
      };

      // Actualizar el informe con las nuevas imágenes o datos
      if (informe) {
        await updateInforme(
          informe.id,
          { ...informe, tipo_proyecto: tipoProyecto, participantes },
          updatedImages
        );
      }

      resetForm();
      message.success("Informe actualizado exitosamente.");
    } catch (error) {
      message.error("Error al actualizar el informe. " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setInformeData({
      nombre_proyecto: "",
      lider_coordinador: "",
      descripcion_beneficiarios: { cant_beneficiarios: 0, descripcion_beneficiarios: "" },
      descripcion_mejora: "",
      riesgo_medioambiental: [],
      medidas_reduccion_medioambiental: [],
    });
    setParticipantes([]);
    setTipoProyecto([]);
    setImages({ antes: [], durante: [], despues: [] });
    setImagesLocked({ antes: false, durante: false, despues: false });
    informeForm.resetFields();
    onClose();
  };

  return (
    <Modal
      title={informe ? "Actualizar Informe" : "Registrar Informe"}
      open={isModalOpen}
      onCancel={onClose}
      footer={[
        <Button
          key="cancel"
          onClick={onClose}
          style={{ backgroundColor: "#c42531", color: "white" }}
        >
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          style={{ backgroundColor: "#0068b1", color: "white" }}
          onClick={handleConfirmSubmit}
          disabled={isLoading}
        >
          {isLoading ? <Spin /> : informe ? "Actualizar Informe" : "Registrar Informe"}
        </Button>,
      ]}
      maskClosable={false}
    >
      <Form form={informeForm} layout="vertical">
        <Form.Item
          name="nombre_proyecto"
          label="Nombre del Proyecto Social Comunitario"
          rules={[{ required: true, message: "Ingrese el nombre del proyecto." }]}
        >
          <Input
            value={informeData.nombre_proyecto}
            onChange={(e) =>
              setInformeData({ ...informeData, nombre_proyecto: e.target.value })
            }
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
          label="Líder / Coordinador/a del equipo"
          rules={[{ required: true, message: "Ingrese el nombre del líder o coordinador." }]}
        >
          <Input
            value={informeData.lider_coordinador}
            onChange={(e) =>
              setInformeData({ ...informeData, lider_coordinador: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item
          name="descripcion_beneficiarios"
          label="Descripción de los beneficiarios"
          rules={[{ required: true, message: "Ingrese la descripción de los beneficiarios." }]}
        >
          <Input.TextArea
            value={informeData.descripcion_beneficiarios.descripcion_beneficiarios}
            onChange={(e) =>
              setInformeData({
                ...informeData,
                descripcion_beneficiarios: {
                  ...informeData.descripcion_beneficiarios,
                  descripcion_beneficiarios: e.target.value,
                },
              })
            }
          />
        </Form.Item>
        <Form.Item
          name="cant_beneficiarios"
          label="Cantidad de beneficiarios/as"
          rules={[{ required: true, message: "Ingrese la cantidad de beneficiarios." }]}
        >
          <Input
            type="number"
            value={informeData.descripcion_beneficiarios.cant_beneficiarios}
            onChange={(e) =>
              setInformeData({
                ...informeData,
                descripcion_beneficiarios: {
                  ...informeData.descripcion_beneficiarios,
                  cant_beneficiarios: Number(e.target.value),
                },
              })
            }
          />
        </Form.Item>
        <Form.Item
          name="descripcion_mejora"
          label="Describa cómo se mejoró la problemática abordada con la implementación del Proyecto Social Comunitario"
          rules={[{ required: true, message: "Ingrese la descripción de la mejora." }]}
        >
          <Input.TextArea
            value={informeData.descripcion_mejora}
            onChange={(e) =>
              setInformeData({ ...informeData, descripcion_mejora: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item
          name="riesgo_medioambiental"
          label="Describa los riesgos medioambientales"
          rules={[{ required: true, message: "Ingrese los riesgos medioambientales." }]}
        >
          <Input.TextArea
            value={informeData.riesgo_medioambiental.join(", ")}
            onChange={(e) =>
              setInformeData({
                ...informeData,
                riesgo_medioambiental: e.target.value.split(","),
              })
            }
          />
        </Form.Item>
        <Form.Item
          name="medidas_reduccion_medioambiental"
          label="Describa las medidas de reducción de impacto medioambiental"
          rules={[{ required: true, message: "Ingrese las medidas de reducción." }]}
        >
          <Input.TextArea
            value={informeData.medidas_reduccion_medioambiental.join(", ")}
            onChange={(e) =>
              setInformeData({
                ...informeData,
                medidas_reduccion_medioambiental: e.target.value.split(","),
              })
            }
          />
        </Form.Item>
        {["antes", "durante", "despues"].map((category) => (
          <Form.Item key={category} label={`Imágenes ${category} (2)`}>
            <Upload
              beforeUpload={(file) => handleUpload(category as "antes" | "durante" | "despues", file)}
              fileList={images[category as keyof typeof images].map((file) => ({
                uid: file.name,
                name: file.name,
                status: "done",
              }))}
              listType="picture"
              disabled={imagesLocked[category as keyof typeof imagesLocked]}
            >
              <Button
                icon={<UploadOutlined />}
                disabled={imagesLocked[category as keyof typeof imagesLocked]}
              >
                {imagesLocked[category as keyof typeof imagesLocked]
                  ? "Imágenes subidas"
                  : "Seleccionar Imágenes"}
              </Button>
            </Upload>
          </Form.Item>
        ))}
        <h4>Participantes</h4>
        <List
          dataSource={participantes}
          renderItem={(participante, index) => (
            <List.Item
              actions={[
                <Button danger type="text" onClick={() => handleRemoveParticipante(index)}>
                  Eliminar
                </Button>,
              ]}
            >
              <strong>{participante.nombre_completo}</strong> - DNI: {participante.no_dni}, Tel:{" "}
              {participante.no_telefono}
            </List.Item>
          )}
        />
        {!isAddingParticipante ? (
          <div className="w-100 d-flex justify-content-center">
            <Button
              type="dashed"
              onClick={() => setIsAddingParticipante(true)}
              style={{
                marginTop: "16px",
                backgroundColor: "#0068b1",
                color: "white",
                borderColor: "#0068b1",
              }}
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
              style={{
                marginRight: "8px",
                backgroundColor: "#0068b1",
                color: "white",
                borderColor: "#0068b1",
              }}
            >
              Agregar
            </Button>
            <Button
              style={{
                backgroundColor: "#c42531",
                color: "white",
                borderColor: "#c42531",
              }}
              onClick={() => setIsAddingParticipante(false)}
            >
              Cancelar
            </Button>
          </Form>
        )}
      </Form>
    </Modal>
  );

}