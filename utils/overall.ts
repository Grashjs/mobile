import { FileType } from '../models/file';
import Meter from '../models/meter';
import {
  FilterField,
  SearchCriteria,
  SearchOperator
} from '../models/page';
import React from 'react';
import { sameDay } from './dates';

export const canAddReading = (meter: Meter): boolean => {
  if (!meter) {
    return false;
  }
  if (!meter.nextReading) return true;
  return (
    sameDay(new Date(), new Date(meter.nextReading)) &&
    !sameDay(new Date(), new Date(meter.lastReading))
  );
};

export const getImageAndFiles = (
  files: { id: number; type: FileType }[],
  imageFallback?
) => {
  return {
    image: files.find((file) => file.type === 'IMAGE')
      ? { id: files.find((file) => file.type === 'IMAGE').id }
      : imageFallback ?? null,
    files: files
      .filter((file) => file.type === 'OTHER')
      .map((file) => {
        return { id: file.id };
      })
  };
};

export const getNextOccurence = (date: Date, days: number): Date => {
  const incrementDays = (date: Date, days: number) => {
    date.setDate(date.getDate() + days);
    return date;
  };
  let result = date;
  if (result > new Date()) {
    result = incrementDays(result, days);
  } else
    while (result < new Date()) {
      result = incrementDays(result, days);
    }
  return result;
};

export const getRandomColor = () => {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const pushOrRemove = (array: string[], push: boolean, value: string) => {
  if (push) {
    array.push(value);
  } else {
    const index = array.findIndex((element) => element === value);
    if (index !== -1) array.splice(index, 1);
  }
  return array;
};

export const onSearchQueryChange = <T>(
  event,
  criteria: SearchCriteria,
  setCriteria: React.Dispatch<React.SetStateAction<SearchCriteria>>,
  fieldsToSearch: Extract<keyof T, string>[]
) => {
  const query = event.target.value;
  let newFilterFields: FilterField[] = [...criteria.filterFields];

  const firstField = fieldsToSearch.shift();
  newFilterFields = newFilterFields.filter(
    // @ts-ignore
    (filterField) => !fieldsToSearch.includes(filterField.field)
  );
  if (query)
    newFilterFields = [
      ...newFilterFields,
      {
        field: firstField,
        value: query,
        operation: 'cn' as SearchOperator,
        alternatives: fieldsToSearch.map((field) => ({
          field,
          operation: 'cn' as SearchOperator,
          value: query
        }))
      }
    ];
  setCriteria({ ...criteria, filterFields: newFilterFields });
};
