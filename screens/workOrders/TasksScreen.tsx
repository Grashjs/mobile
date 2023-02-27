import { Task } from '../../models/tasks';
import { patchTask } from '../../slices/task';
import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useState } from 'react';
import { useDispatch } from '../../store';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import { View } from '../../components/Themed';
import { StyleSheet } from 'react-native';
import SingleTask from '../../components/SingleTask';
import { RootStackScreenProps } from '../../types';

export default function TasksScreen({
                                      navigation,
                                      route
                                    }: RootStackScreenProps<'Tasks'>) {
  const { t }: { t: any } = useTranslation();
  const { tasksProps, workOrderId } = route.params;
  const [openSelectImages, setOpenSelectImages] = useState<boolean>(false);
  const initialNotes = new Map();
  tasksProps.forEach((task) => {
    if (task.notes || task.images.length) {
      initialNotes.set(task.id, true);
    }
  });
  const [notes, setNotes] = useState<Map<number, boolean>>(initialNotes);
  const [tasks, setTasks] = useState<Task[]>(tasksProps);
  const [currentTask, setCurrentTask] = useState<Task>();
  const dispatch = useDispatch();
  const { showSnackBar } = useContext(CustomSnackBarContext);

  useEffect(() => setTasks(tasksProps), [tasksProps]);

  function handleChange(value: string | number, id: number) {
    const task = tasks.find((task) => task.id === id);
    dispatch(patchTask(workOrderId, id, { ...task, value }))
      .then(() => showSnackBar(t('task_update_success'), 'success'))
      .catch(() => showSnackBar(t('task_update_failure'), 'error'));

    const newTasks = tasks.map((task) => {
      if (task.id === id) {
        return { ...task, value };
      }
      return task;
    });
    setTasks(newTasks);
  }

  function handleNoteChange(value: string, id: number) {
    const newTasks = tasks.map((task) => {
      if (task.id === id) {
        return { ...task, notes: value };
      }
      return task;
    });
    setTasks(newTasks);
  }

  function toggleNotes(id: number) {
    const newNotes = new Map(notes);
    newNotes.set(id, !newNotes.get(id));
    setNotes(newNotes);
  }

  function handleSaveNotes(value: string, id: number) {
    const task = tasks.find((task) => task.id === id);
    return dispatch(patchTask(workOrderId, id, { ...task, notes: value })).then(
      () => {
        showSnackBar(t('notes_save_success'), 'success');
        toggleNotes(task.id);
      }
    );
  }

  function handleSelectImages(id: number) {
    setCurrentTask(tasks.find((task) => task.id === id));
    setOpenSelectImages(true);
  }

  const onImageUploadSuccess = () => {
    setOpenSelectImages(false);
    showSnackBar(t('images_add_task_success'), 'success');
  };
  const onImageUploadFailure = (err) =>
    showSnackBar(t('images_add_task_failure'), 'error');
  const handleZoomImage = () => {
  };

  return (<View style={styles.container}>
    {tasks.map((task) => (
      <SingleTask
        key={task.id}
        task={task}
        handleChange={handleChange}
        handleNoteChange={handleNoteChange}
        handleSaveNotes={handleSaveNotes}
        toggleNotes={toggleNotes}
        handleSelectImages={handleSelectImages}
        handleZoomImage={handleZoomImage}
        notes={notes}
      />
    ))}
  </View>);

}
const styles = StyleSheet.create({
  container: {
    flex: 1, paddingHorizontal: 20
  }
});
