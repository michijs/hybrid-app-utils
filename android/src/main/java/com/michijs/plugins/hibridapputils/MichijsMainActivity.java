package com.michijs.plugins.hibridapputils;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;

import androidx.annotation.Nullable;
import androidx.documentfile.provider.DocumentFile;

import com.getcapacitor.BridgeActivity;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.util.ArrayList;

import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;

import androidx.activity.result.contract.ActivityResultContracts;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class MichijsMainActivity extends BridgeActivity {
  public ActivityResultLauncher<Intent> saveFileLauncher;
  public ActivityResultLauncher<Intent> openFileLauncher;
  public ActivityResultLauncher<Intent> shareLauncher;
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

    shareLauncher = registerForActivityResult(new ActivityResultContracts.StartActivityForResult(),
        result -> {
            javascriptInterface.notifyShareResult(result.getResultCode() == RESULT_OK);
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
