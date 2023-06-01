package com.michijs.plugins.hibridapputils;

import android.content.Context;
import android.net.Uri;
import android.widget.Toast;

import androidx.documentfile.provider.DocumentFile;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;

class FileUtils {
  private final Context context;

  FileUtils(Context context) {
    this.context = context;
  }

  public void saveFile(Uri uri, String content) {
    try {
      OutputStream outputStream = context.getContentResolver().openOutputStream(uri);
      if (outputStream != null) {
        // Replace this with your actual save file logic
        // For example, you can create a file and write data to it
        // Here, we are creating a sample file with some content
        outputStream.write(content.getBytes());
        outputStream.close();
      }
    } catch (IOException e) {
      e.printStackTrace();
      Toast.makeText(context, "Failed to save file", Toast.LENGTH_SHORT).show();
    }
  }

  public File createTempFile(String name, String content) {
    try {
      String[] fileNameSplitted = name.split("\\|");
      File file = File.createTempFile(fileNameSplitted[0], fileNameSplitted[1], context.getCacheDir());
      FileWriter fileWriter = new FileWriter(file);

      // Create a BufferedWriter object using the FileWriter
      BufferedWriter bufferedWriter = new BufferedWriter(fileWriter);

      // Write the text into the file
      bufferedWriter.write(content);

      // Close the BufferedWriter
      bufferedWriter.close();

      file.deleteOnExit();
      return file;
    } catch(IOException e){
      e.printStackTrace();
      Toast.makeText(context, "Failed to create temp file", Toast.LENGTH_SHORT).show();
    }
    return null;
  }

  public String readFile(Uri fileUri) {
    StringBuilder contentBuilder = new StringBuilder();
    try {
      InputStream inputStream = context.getContentResolver().openInputStream(fileUri);
      BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
      String line;
      while ((line = bufferedReader.readLine()) != null) {
        contentBuilder.append(line);
      }
      bufferedReader.close();
    } catch (IOException e) {
      e.printStackTrace();
      Toast.makeText(context, "Failed to read file", Toast.LENGTH_SHORT).show();
    }
    return contentBuilder.toString();
  }

  public String getName(Uri fileUri) {
    DocumentFile documentFile = DocumentFile.fromSingleUri(context, fileUri);
    return documentFile != null ? documentFile.getName(): null;
  }

  public String getType(Uri fileUri) {
    DocumentFile documentFile = DocumentFile.fromSingleUri(context, fileUri);
    return documentFile != null ? documentFile.getType() : null;
  }
}
