package com.michijs.plugins.hibridapputils;

import android.content.Context;
import android.os.Build;

import androidx.annotation.RequiresApi;

public class ColorUtils {
    Context context;

    ColorUtils(Context context){
        this.context = context;
    }

    @RequiresApi(api = Build.VERSION_CODES.TIRAMISU)
    public String getColor(int id){
        int color = context.getResources().getColor(id, context.getTheme());
        return String.format("#%06X", (0xFFFFFF & color));
    }
}
