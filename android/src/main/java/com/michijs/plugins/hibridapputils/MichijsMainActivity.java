package com.michijs.plugins.hibridapputils;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;

import androidx.annotation.Nullable;
import androidx.documentfile.provider.DocumentFile;

import com.getcapacitor.BridgeActivity;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;

import androidx.activity.result.contract.ActivityResultContracts;

class FileUtils {
  private Context context;

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
}

class JavaScriptInterface {
  public Uri openedFileUri;
  private MichijsMainActivity context;
  private FileUtils fileUtils;

  JavaScriptInterface(MichijsMainActivity context) {
    this.context = context;
    this.fileUtils = new FileUtils(context);
  }

  @JavascriptInterface
  public void showSaveFilePicker(String suggestedName, String suggestedType) {
    Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
    intent.addCategory(Intent.CATEGORY_OPENABLE);
    intent.setType(suggestedType);
    intent.putExtra(Intent.EXTRA_TITLE, suggestedName);

    context.saveFileLauncher.launch(intent);
  }

  @JavascriptInterface
  public void showOpenFilePicker(String suggestedType) {
    Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
    intent.addCategory(Intent.CATEGORY_OPENABLE);
    intent.setType(suggestedType);

    context.openFileLauncher.launch(intent);
  }

  @JavascriptInterface
  public void saveOpenedFile(String content) {
    fileUtils.saveFile(openedFileUri, content);
  }

  @JavascriptInterface
  public String getOpenedFileContent() {
    return fileUtils.readFile(openedFileUri);
  }

  @JavascriptInterface
  public String getOpenedFileName() {
    DocumentFile documentFile = DocumentFile.fromSingleUri(context, openedFileUri);
    return documentFile.getName();
  }

  @JavascriptInterface
  public String getOpenedFileType() {
    DocumentFile documentFile = DocumentFile.fromSingleUri(context, openedFileUri);
    return documentFile.getType();
  }

  public void notifySaveFilePickerResult(Boolean result) {
    WebView webView = context.getBridge().getWebView();
    webView.evaluateJavascript(
        "window.HybridInterface?.onShowSaveFilePickerHasResult?.(" + result + ")", null);
  }

  public void notifyOpenFilePickerResult(Boolean result) {
    WebView webView = context.getBridge().getWebView();
      webView.evaluateJavascript(
          "window.HybridInterface?.onShowOpenFilePickerHasResult?.("+result+")",
          null);
  }

  public void notifyNewOpenFileOpened() {
    WebView webView = context.getBridge().getWebView();
    webView.evaluateJavascript("window.HybridInterface?.onNewOpenFileOpened?.()", null);
  }
}

public class MichijsMainActivity extends BridgeActivity {
  public ActivityResultLauncher<Intent> saveFileLauncher;
  public ActivityResultLauncher<Intent> openFileLauncher;
  private JavaScriptInterface javascriptInterface = new JavaScriptInterface(this);

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    WebView webView = getBridge().getWebView();

    // Set up the WebView
    webView.getSettings().setJavaScriptEnabled(true);
    webView.addJavascriptInterface(javascriptInterface, "HybridInterface");

    saveFileLauncher = registerForActivityResult(new ActivityResultContracts.StartActivityForResult(),
        result -> {
          if (result.getResultCode() == RESULT_OK) {
            Intent data = result.getData();
            if (data != null) {
              Uri uri = data.getData();
              if (uri != null) {
                // Perform the saving operation using the selected file URI
                javascriptInterface.openedFileUri = uri;
                javascriptInterface.saveOpenedFile("");
                javascriptInterface.notifySaveFilePickerResult(true);
              }
            }
          } else {
            javascriptInterface.notifySaveFilePickerResult(false);
          }
        });

    openFileLauncher = registerForActivityResult(new ActivityResultContracts.StartActivityForResult(),
        result -> {
          if (result.getResultCode() == RESULT_OK) {
            Intent data = result.getData();
            if (data != null) {
              Uri uri = data.getData();
              if (uri != null) {
                // Process the selected file URI
                javascriptInterface.openedFileUri = uri;
                javascriptInterface.notifyOpenFilePickerResult(true);
              }
            }
          } else {
            javascriptInterface.notifyOpenFilePickerResult(false);
          }
        });
  }

  @Override
  protected void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    // Retrieve the intent that started this activity
    String action = intent.getAction();

    if (Intent.ACTION_VIEW.equals(action)) {
      // Handle plain text file
      javascriptInterface.openedFileUri = intent.getData();
      javascriptInterface.notifyNewOpenFileOpened();
    }
  }
}
